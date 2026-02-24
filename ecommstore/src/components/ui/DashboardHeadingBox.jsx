"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const DashboardHeadingBox = ({
  text,
  icon,
  subHeading,
  className,
  button,
  backToText,
}) => {
  const navigate = useRouter();
  return (
    <div
      className={`rounded bg-black p-6 mb-3 text-white shadow-md ${className}`}
    >
      <button
        onClick={() => navigate.back()}
        className="flex gap-2 items-center text-white text-[14px] py-1"
      >
        {" "}
        <ArrowLeft size={16} /> Go Back{" "}
      </button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{text}</h1>
          <p className="text-white text-[14px] py-1">{subHeading || ""}</p>
        </div>
        <div className="flex items-center gap-3">{button}</div>
      </div>
    </div>
  );
};

export default DashboardHeadingBox;
