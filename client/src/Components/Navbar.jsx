import { Headset, Search, Heart, ShoppingCart, CircleUserRound, Menu, X } from 'lucide-react';
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { useState } from 'react';
import { Navlinks } from '../constants/utlits';
import { NavLink } from "react-router-dom"

const categories = [
  { id: 1, name: 'All Categories' },
  { id: 2, name: 'Electronics' },
  { id: 3, name: 'Fashion' },
];

const Navbar = () => {
  const [setselected, setSetselected] = useState("All Categories");
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <header className="w-screen overflow-x-hidden border-b border-(--border-default) mb-6">
      {/* Top Banner */}
      <div className="flex justify-between w-full text-(--text-inverse) bg-(--bg-primary) px-3 md:px-5 py-3 text-xs md:text-sm">
        <h4 className='hidden sm:block'>👋Welcome to Worldwide Electronics Store</h4>
        <h4 className='text-center flex-1 sm:flex-initial'>For A Limited Time Only! <span className='underline cursor-pointer'>Shop Now</span></h4>
        <div className='hidden lg:flex gap-2 items-center'>
          <Headset size={16} />+9233848248
        </div>
      </div>

      {/* Main Header */}
      <div className='flex justify-between items-center px-3 md:px-5 py-3 gap-2'>
        <h1 className='font-medium text-xl md:text-2xl text-(--text-heading) whitespace-nowrap'>Ecom Store.</h1> 
        
        {/* Desktop Search Form */}
        <form className='hidden lg:flex justify-center items-center flex-1 max-w-3xl mx-4'>
          <Listbox>
            <ListboxButton className='text-(--btn-text-primary) bg-(--btn-bg-primary) border-r-0 border border-(--border-default) rounded-full cursor-pointer px-4 py-2.5 flex translate-x-7 relative whitespace-nowrap'>
              {setselected} <MdOutlineKeyboardArrowDown size={16} className='ml-2 mt-1' />
            </ListboxButton>
            <ListboxOptions className="absolute left-64 top-26 bg-(--dropdown-bg) border border-(--dropdown-border) rounded-lg z-50">
              {categories.map((category) => (
                <ListboxOption
                  key={category.id}
                  value={category.name}
                  onClick={() => setSetselected(category.name)}
                  className="text-(--dropdown-text) cursor-pointer border-b border-(--border-default) px-4 py-2.5 flex"
                >
                  {category.name}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
          <input
            type="search"
            placeholder='Search products...'
            className='placeholder:text-sm placeholder:text-(--text-placeholder) bg-(--bg-surface) border-l-0 border border-(--border-default) rounded-full px-10 py-2 w-2/3 outline-0'
          />
          <Search
            size={36}
            className='p-3 -translate-x-10 cursor-pointer bg-(--bg-primary) text-(--icon-inverse) rounded-full hover:bg-(--btn-bg-hover-secondary)'
          />
        </form>

        {/* Desktop Icons */}
        <div className='hidden lg:flex gap-4 xl:gap-6 items-center text-(--text-secondary)'>
          <button>
            <Heart
              size={35}
              className='text-(--icon-default) cursor-pointer border border-(--border-default) rounded-full p-2 hover:bg-(--btn-bg-hover) hover:text-(--btn-text-hover) transition-all duration-300'
            />
          </button>

          <button className="group border border-(--border-default) rounded-full grid grid-cols-[auto_1fr] items-center gap-2 px-2 py-1
                hover:bg-(--cart-bg-hover) hover:text-(--cart-text-hover) transition-all duration-300 cursor-pointer">
            <ShoppingCart
              size={35}
              className="bg-(--cart-icon-bg) text-(--cart-icon-text) border border-(--border-default) rounded-full p-2
               group-hover:bg-(--cart-icon-bg-hover) group-hover:text-(--cart-icon-text-hover) transition-all duration-300"
            />
            <div className="leading-tight">
              <h3 className="text-sm">Total</h3>
              <span className="font-bold text-sm">Rs. 0.00</span>
            </div>
          </button>

          <button>
            <CircleUserRound
              size={35}
              className='text-(--icon-default) cursor-pointer border border-(--border-default) rounded-full p-2 hover:bg-(--btn-bg-hover) hover:text-(--btn-text-hover) transition-all duration-300'
            />
          </button>
        </div>

        {/* Mobile Icons */}
        <div className='flex lg:hidden gap-3 items-center'>
          <button className='lg:hidden'>
            <ShoppingCart size={24} className='text-(--icon-default)' />
          </button>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className='lg:hidden'
          >
            {menuOpen ? (
              <X size={28} className='text-(--icon-default)' />
            ) : (
              <Menu size={28} className='text-(--icon-default)' />
            )}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className='hidden lg:flex gap-7 px-5 py-3'>
        {Navlinks.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `hover:text-(--text-hover)
                transition-all duration-200
                border-b-2 border-transparent
                hover:border-b
                hover:border-b-(--text-hover)
                ${isActive ? 'text-(--text-hover)' : 'text-(--text-primary)'}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className='lg:hidden bg-(--bg-surface) border-t border-(--border-default)'>
          {/* Mobile Search */}
          <div className='px-3 py-4 border-b border-(--border-default)'>
            <form className='flex flex-col gap-3'>
              <Listbox>
                <ListboxButton className='text-(--btn-text-primary) bg-(--btn-bg-primary) border border-(--border-default) rounded-full cursor-pointer px-4 py-2.5 flex justify-between items-center w-full'>
                  {setselected} <MdOutlineKeyboardArrowDown size={16} />
                </ListboxButton>
                <ListboxOptions className="bg-(--dropdown-bg) border border-(--dropdown-border) rounded-lg mt-2 w-full">
                  {categories.map((category) => (
                    <ListboxOption
                      key={category.id}
                      value={category.name}
                      onClick={() => setSetselected(category.name)}
                      className="text-(--dropdown-text) cursor-pointer border-b border-(--border-default) px-4 py-2.5"
                    >
                      {category.name}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Listbox>
              <div className='relative'>
                <input
                  type="search"
                  placeholder='Search products...'
                  className='placeholder:text-sm placeholder:text-(--text-placeholder) bg-(--bg-surface) border border-(--border-default) rounded-full px-4 py-2 w-full outline-0 pr-12'
                />
                <Search
                  size={32}
                  className='absolute right-1 top-1/2 -translate-y-1/2 p-2 cursor-pointer bg-(--bg-primary) text-(--icon-inverse) rounded-full hover:bg-(--btn-bg-hover-secondary)'
                />
              </div>
            </form>
          </div>

          {/* Mobile Navigation Links */}
          <nav className='flex flex-col px-3 py-2'>
            {Navlinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `py-3 px-2 border-b border-(--border-default) hover:text-(--text-hover) transition-all duration-200
                    ${isActive ? 'text-(--text-hover) font-medium' : 'text-(--text-primary)'}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Action Buttons */}
          <div className='flex justify-around items-center px-3 py-4 border-t border-(--border-default)'>
            <button>
              <Heart
                size={32}
                className='text-(--icon-default) cursor-pointer border border-(--border-default) rounded-full p-2 hover:bg-(--btn-bg-hover) hover:text-(--btn-text-hover) transition-all duration-300'
              />
            </button>
            <button>
              <CircleUserRound
                size={32}
                className='text-(--icon-default) cursor-pointer border border-(--border-default) rounded-full p-2 hover:bg-(--btn-bg-hover) hover:text-(--btn-text-hover) transition-all duration-300'
              />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar;