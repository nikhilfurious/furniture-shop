import { ClipboardCopy, Gift } from "lucide-react";
import { useState } from "react";

const SpecialOffers = () => {
  const [copied, setCopied] = useState(false);
  const offerCode = "SAVE20";

  const handleCopy = () => {
    navigator.clipboard.writeText(offerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-gray-400 rounded-lg shadow-md">
      {/* Icon */}
      <div className="p-2 rounded-full">
        <Gift className="w-6 h-6" />
      </div>

      {/* Offer Details */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">
          Get <span className="text-green-600">20% off</span> up to{" "}
          <span className="text-green-600">Rs. 400</span> on your 2nd month's rent.
        </p>
        <p className="text-xs text-gray-600">
          Applicable to orders of <span className="font-semibold">Rs. 2000</span> and above.
        </p>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 border-2 text-black border-red-50 px-3 py-1.5 text-sm rounded-lg hover:bg-red-700 hover:text-white transition"
      >
        {copied ? "Copied!" : "Copy"}
        <ClipboardCopy className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SpecialOffers;
