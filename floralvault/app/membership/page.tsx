"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const membershipTiers = [
  {
    name: "Free",
    price: {
      monthly: "$0/mo",
      yearly: "$0/yr",
    },
    description: "Basic access for hobbyists & casual users.",
    benefits: [
      "Save up to 25 plants",
      "Access public collections",
      "Marketplace access",
      "Community comments",
    ],
    plan: "free",
  },
  {
    name: "Pro",
    price: {
      monthly: "$10/mo",
      yearly: "$100/yr (save 20%)",
    },
    description: "For serious enthusiasts seeking a vast collection.",
    benefits: [
      "Save unlimited plants",
      "Sell on marketplace",
      "Private your collections",
      "Custom profile",
    ],
    plan: "pro",
  },
  {
    name: "Premium",
    price: {
      monthly: "$25/mo",
      yearly: "$240/yr (save 20%)",
    },
    description: "For professionals & power users.",
    benefits: [
      "All Pro benefits",
      "All listings are featured",
      "Discounted listing fee",
      "Unlock video Thumbnails",
    ],
    plan: "premium",
  },
];

const MembershipPage = () => {
  const { user } = useUser();
  const [isYearly, setIsYearly] = useState(false);

  const currentPlan = user?.plan ?? "free";

  const handleUpgrade = (plan: string) => {
    console.log(`Upgrade to ${plan} clicked`);
    // TODO: Hook into payment/upgrade flow (Stripe, etc.)
  };

  const handleCancelMembership = () => {
    console.log("Cancel membership clicked");
    // TODO: Hook into Stripe cancel subscription flow
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-white">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Membership Plans
      </h1>

      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3">
          <span
            className={!isYearly ? "font-bold text-[#81a308]" : "text-gray-400"}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-12 h-6 flex items-center bg-gray-600 rounded-full p-1 transition ${
              isYearly ? "bg-[#81a308]" : "bg-gray-600"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                isYearly ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={isYearly ? "font-bold text-[#81a308]" : "text-gray-400"}
          >
            Yearly
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membershipTiers.map((tier) => (
          <Card
            key={tier.plan}
            className={`border ${
              currentPlan === tier.plan
                ? "border-[#81a308] shadow-lg"
                : "border-gray-700"
            } bg-[#1f1f1f] flex flex-col justify-between`}
          >
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {tier.name}
              </CardTitle>
              <p className="text-center text-lg text-gray-300 mt-2">
                {isYearly ? tier.price.yearly : tier.price.monthly}
              </p>

              <p className="text-center text-sm text-gray-400 mt-2">
                {tier.description}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#81a308] font-bold">✔</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex justify-center">
                {currentPlan === tier.plan ? (
                  <Button
                    disabled
                    className="bg-gray-600 cursor-default rounded-2xl px-6 py-2"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="bg-[#81a308] hover:bg-[#6ca148] rounded-2xl px-6 py-2"
                    onClick={() => handleUpgrade(tier.plan)}
                  >
                    {tier.plan === "free" ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cancel Membership Section */}
      {currentPlan !== "free" && (
        <div className="mt-12 text-center border border-[#dab9df] rounded-2xl p-6 max-w-2xl mx-auto bg-[#1f1f1f]">
          <h2 className="text-2xl font-semibold mb-4">Manage Subscription</h2>
          <p className="text-gray-300 mb-6">
            You are currently subscribed to the{" "}
            <span className="text-[#81a308] font-semibold">{currentPlan}</span>{" "}
            plan. You can cancel your subscription anytime.
          </p>
          <Button
            variant="destructive"
            className="rounded-2xl px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleCancelMembership}
          >
            Cancel Membership
          </Button>
        </div>
      )}

      <div className="mt-10 text-center text-gray-400 text-sm">
        {/* Placeholder: Add your Stripe subscription integration here */}
        Need help? Contact{" "}
        <a
          href="/contact"
          className="text-[#81a308] hover:underline font-medium"
        >
          support
        </a>
        .
      </div>
    </div>
  );
};

export default MembershipPage;
