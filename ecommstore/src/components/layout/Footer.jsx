'use client';
import { FaXTwitter, FaYoutube } from "react-icons/fa6";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import { Navlinks } from "@/lib/utils";

const icons = [FaXTwitter, FaYoutube, FaFacebook, FaInstagram]
const supportPages = [{ name: "Contact", path: "/contact" }, { name: "About Us", path: "/about" }, { name: "Blog", path: "/blog" }, { name: "FAQ", path: "/faq" }]

const Footer = () => {
    return (
        <footer className='bg-[#1F1F1F] p-1 text-white'>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  p-10">
                {/* About section */}
                <div>
                    <h2 className="font-bold text-2xl">Ecom Store.</h2>
                    <p className="text-[13px] text-(--text-secondary) my-3">At Ecom Store, we are committed to providing you with the best possible shopping experience. Get started today and experience the convenience of online shopping.</p>
                    <h3 className="font-semibold mb-2">Follow us on Social Media</h3>
                    <div className="flex gap-3" >
                        {icons.map((Icon) => (
                            <Icon key={Icon.name} size={25} className="text-(--color-brand-primary) bg-[#323232] rounded-2xl p-1 cursor-pointer hover:bg-(--bg-inverse)" />
                        ))}
                    </div>
                </div>
                {/* Pages section */}
                <div className="flex flex-col md:flex-row lg:flex-row justify-around my-5 md:my-0 lg:my-0">
                    <div>
                        <h2 className="font-bold text-xl">Pages</h2>
                        <ul className="flex flex-col">
                            {Navlinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.path}
                                    className={`text-[13px] text-(--text-secondary) my-2 hover:text-(--color-brand-primary)`}>
                                    {link.name}
                                </Link>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="font-bold text-xl">Support</h2>
                        <ul className="flex flex-col">
                            {supportPages.map((page) => (
                                <Link 
                                key={page.name} 
                                href={page.path} 
                                className="text-[13px] text-(--text-secondary) my-2 hover:text-(--color-brand-primary)">
                                    {page.name}
                                </Link>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Newsletter section */}
                <div>
                    <h3>Subscribe to our newsletter</h3>
                    <p className="text-[13px] text-(--text-secondary) my-3">Sign up for our newsletter to get the latest updates and exclusive offers.</p>
                    <form className="flex flex-col justify-start items-start">
                        <input type="email" placeholder="Enter your email" className="bg-[#323232] w-10/12 p-2 rounded-md mb-3" />
                        <button className="bg-(--btn-bg-primary) text-white px-6 py-2 rounded-full hover:bg-(--btn-bg-hover-primary)">Subscribe</button>
                    </form>
                </div>
            </div>
            {/* Copyright section */}
            <div className="border-t border-(--border-default)">
                <p className="text-[13px] text-(--text-secondary) text-center my-3">© 2025 Ecom Store. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer;