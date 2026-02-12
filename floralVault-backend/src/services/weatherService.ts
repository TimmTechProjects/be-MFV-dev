import axios from 'axios';
import prisma from '../prisma/client';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_ONECALL_URL = 'https://api.openweathermap.org/data/3.0';

interface LocationData {
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface CareAdjustment {
  type: string;
  action: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Get or create user location
 */
export const getUserLocation = async (userId: string) => {
  return await prisma.userLocation.findUnique({
    where: { userId },
  });
};

/**
 * Set user location
 */
export const setUserLocation = async (userId: string, data: LocationData) => {
  const existing = await prisma.userLocation.findUnique({
    where: { userId },
  });

  if (existing) {
    return await prisma.userLocation.update({
      where: { userId },
      data: {
        city: data.city,
        state: data.state,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      },
    });
  }

  return await prisma.userLocation.create({
    data: {
      userId,
      city: data.city,
      state: data.state,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    },
  });
};

/**
 * Get current weather from OpenWeatherMap
 */
export const getCurrentWeather = async (latitude: number, longitude: number) => {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'imperial', // Fahrenheit
      },
    });

    const data = response.data;
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: Math.round(data.wind.speed),
      cloudCover: data.clouds.all,
      pressure: data.main.pressure,
      visibility: data.visibility,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
    };
  } catch (error: any) {
    console.error('Error fetching current weather:', error.response?.data || error.message);
    throw new Error('Failed to fetch current weather');
  }
};

/**
 * Get 7-day weather forecast
 */
export const getWeatherForecast = async (latitude: number, longitude: number) => {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  try {
    // Using the free tier 5-day forecast endpoint
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'imperial',
      },
    });

    const data = response.data;
    
    // Group forecast data by day (API returns 3-hour intervals)
    const dailyForecasts: any[] = [];
    const dailyData: { [key: string]: any[] } = {};

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // Process each day
    Object.entries(dailyData).forEach(([date, items]: [string, any[]]) => {
      const temps = items.map(i => i.main.temp);
      const conditions = items.map(i => i.weather[0].main);
      const rain = items.reduce((sum, i) => sum + (i.rain?.['3h'] || 0), 0);
      
      // Get midday forecast for icon
      const middayForecast = items[Math.floor(items.length / 2)];

      dailyForecasts.push({
        date: new Date(date),
        tempHigh: Math.round(Math.max(...temps)),
        tempLow: Math.round(Math.min(...temps)),
        condition: middayForecast.weather[0].main,
        description: middayForecast.weather[0].description,
        icon: middayForecast.weather[0].icon,
        humidity: middayForecast.main.humidity,
        windSpeed: Math.round(middayForecast.wind.speed),
        precipChance: items.filter(i => i.pop > 0).length > 0 ? Math.round(Math.max(...items.map(i => i.pop)) * 100) : 0,
        rainAmount: rain,
      });
    });

    return dailyForecasts.slice(0, 7); // Return up to 7 days
  } catch (error: any) {
    console.error('Error fetching forecast:', error.response?.data || error.message);
    throw new Error('Failed to fetch weather forecast');
  }
};

/**
 * Analyze weather and generate care recommendations
 */
export const getCareAdjustments = async (latitude: number, longitude: number): Promise<CareAdjustment[]> => {
  const current = await getCurrentWeather(latitude, longitude);
  const forecast = await getWeatherForecast(latitude, longitude);
  
  const adjustments: CareAdjustment[] = [];

  // Check for frost warning (below 32°F)
  const frostDanger = forecast.some(day => day.tempLow <= 32);
  if (frostDanger) {
    adjustments.push({
      type: 'frost',
      action: 'Bring sensitive plants indoors tonight',
      reason: 'Frost expected in the next few days',
      priority: 'high',
    });
  }

  // Check for extreme heat (above 95°F)
  if (current.temperature >= 95 || forecast.some(day => day.tempHigh >= 95)) {
    adjustments.push({
      type: 'heat',
      action: 'Water plants more frequently',
      reason: 'Extreme heat detected',
      priority: 'high',
    });
    adjustments.push({
      type: 'heat',
      action: 'Provide shade for heat-sensitive plants',
      reason: 'Temperatures exceeding 95°F',
      priority: 'medium',
    });
  }

  // Check for rain (reduce watering)
  const upcomingRain = forecast.slice(0, 3).reduce((sum, day) => sum + day.rainAmount, 0);
  if (upcomingRain > 0.5) {
    adjustments.push({
      type: 'rain',
      action: 'Reduce watering - rain expected',
      reason: `${upcomingRain.toFixed(1)} inches of rain forecasted`,
      priority: 'medium',
    });
  }

  // Check for strong winds
  if (current.windSpeed >= 25 || forecast.some(day => day.windSpeed >= 25)) {
    adjustments.push({
      type: 'wind',
      action: 'Secure outdoor plants and pots',
      reason: 'Strong winds detected',
      priority: 'medium',
    });
  }

  // Check for low humidity (below 30%)
  if (current.humidity < 30) {
    adjustments.push({
      type: 'humidity',
      action: 'Mist humidity-loving plants',
      reason: 'Low humidity detected',
      priority: 'low',
    });
  }

  // Check for storms
  const stormConditions = forecast.some(day => 
    ['Thunderstorm', 'Storm'].includes(day.condition)
  );
  if (stormConditions) {
    adjustments.push({
      type: 'storm',
      action: 'Move outdoor plants to sheltered area',
      reason: 'Severe weather expected',
      priority: 'high',
    });
  }

  return adjustments;
};

/**
 * Get weather alerts for user
 */
export const getWeatherAlerts = async (userId: string) => {
  return await prisma.weatherAlert.findMany({
    where: {
      userId,
      dismissed: false,
    },
    orderBy: {
      sentAt: 'desc',
    },
  });
};

/**
 * Create weather alert
 */
export const createWeatherAlert = async (
  userId: string,
  alertType: string,
  message: string,
  severity: string
) => {
  return await prisma.weatherAlert.create({
    data: {
      userId,
      alertType,
      message,
      severity,
    },
  });
};

/**
 * Dismiss weather alert
 */
export const dismissWeatherAlert = async (alertId: string) => {
  return await prisma.weatherAlert.update({
    where: { id: alertId },
    data: { dismissed: true },
  });
};

/**
 * Check weather conditions and create alerts if needed
 */
export const checkAndCreateAlerts = async (userId: string, latitude: number, longitude: number) => {
  const adjustments = await getCareAdjustments(latitude, longitude);
  
  // Only create alerts for high-priority adjustments
  const highPriorityAlerts = adjustments.filter(adj => adj.priority === 'high');
  
  for (const alert of highPriorityAlerts) {
    // Check if similar alert already exists (within last 24 hours)
    const recentAlert = await prisma.weatherAlert.findFirst({
      where: {
        userId,
        alertType: alert.type,
        sentAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!recentAlert) {
      await createWeatherAlert(userId, alert.type, alert.action, 'warning');
    }
  }
};
