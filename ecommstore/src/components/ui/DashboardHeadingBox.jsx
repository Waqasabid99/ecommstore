
const DashboardHeadingBox = ({ text, icon, subHeading, className }) => {
  return (
    <div className={`rounded bg-black p-6 mb-3 text-white shadow-md ${className}`}>
        <h1 className="text-2xl font-semibold">
          {text}
        </h1>
        <p className="text-white text-[14px] py-1">{subHeading || ''}</p>
    </div>
  )
}

export default DashboardHeadingBox