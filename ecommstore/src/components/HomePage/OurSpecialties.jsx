import { specialties } from "@/lib/utils"

const OurSpecialties = () => {
    return (
        <section className="m-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            {specialties.map((specialty) => (
                <div key={specialty.text} className="flex items-center gap-4 border border-(--border-default) rounded-2xl px-2">
                    <>
                        <specialty.icon className="w-7.5 h-7.5 md:w-12.5 md:h-12.5" />
                        <div className="border-l border-(--border-default) h-full px-2 py-2">
                            <h2 className="font-semibold text-[14px]">{specialty.title}</h2>
                            <p className="text-(--text-secondary) text-[10px]">{specialty.text}</p>
                        </div>
                    </>
                </div>
            ))}
        </section>
    )
}

export default OurSpecialties
