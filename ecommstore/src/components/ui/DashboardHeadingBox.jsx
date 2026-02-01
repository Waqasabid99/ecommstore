
const DashboardHeadingBox = ({ text, icon, subHeading, className, button }) => {
  return (
    <div className={`flex justify-between items-center rounded bg-black p-6 mb-3 text-white shadow-md ${className}`}>
      <div>
        <h1 className="text-2xl font-semibold">
          {text}
        </h1>
        <p className="text-white text-[14px] py-1">{subHeading || ''}</p>
      </div>
        {button}
    </div>
  )
}

export default DashboardHeadingBox