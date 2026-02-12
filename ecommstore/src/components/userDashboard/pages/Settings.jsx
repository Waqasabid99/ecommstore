"use client";
import { useState, useEffect } from "react";
import DashboardHeadingBox from "@/components/ui/DashboardHeadingBox";
import useAuthStore from "@/store/authStore";
import { Country, State, City } from "country-state-city";
import { baseUrl } from "@/lib/utils";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Loader from "@/components/ui/Loader";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";

const Settings = () => {
  const { user, address } = useAuthStore();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });

  // Country, State, City data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Initialize countries on mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(
      allCountries.map((country) => ({
        value: country.isoCode,
        label: country.name,
        flag: country.flag,
      }))
    );
  }, []);

  // Initialize with first address or null
  useEffect(() => {
    if (address && address.length > 0) {
      setSelectedAddressId(address[0].id);
      setCurrentAddress(address[0]);
    }
  }, [address]);

  // Update form data when user or currentAddress changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.userName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (currentAddress) {
      // Get full country name from ISO code
      const country = Country.getAllCountries().find(
        (c) => c.isoCode === currentAddress.country || c.name === currentAddress.country
      );
      
      // Get full state name from ISO code
      let state = null;
      if (country) {
        state = State.getStatesOfCountry(country.isoCode).find(
          (s) => s.isoCode === currentAddress.state || s.name === currentAddress.state
        );
      }

      // Get full city name
      let city = null;
      if (country && state) {
        city = City.getCitiesOfState(country.isoCode, state.isoCode).find(
          (c) => c.name === currentAddress.city
        );
      }

      setFormData((prev) => ({
        ...prev,
        phone: currentAddress.phone || "",
        line1: currentAddress.line1 || "",
        line2: currentAddress.line2 || "",
        country: country?.isoCode || currentAddress.country || "",
        state: state?.isoCode || currentAddress.state || "",
        city: currentAddress.city || "",
        postalCode: currentAddress.postalCode || "",
      }));

      // Load states for selected country
      if (country) {
        const countryStates = State.getStatesOfCountry(country.isoCode);
        setStates(
          countryStates.map((state) => ({
            value: state.isoCode,
            label: state.name,
          }))
        );

        // Load cities for selected state
        if (state) {
          const stateCities = City.getCitiesOfState(country.isoCode, state.isoCode);
          setCities(
            stateCities.map((city) => ({
              value: city.name,
              label: city.name,
            }))
          );
        }
      }
    }
  }, [currentAddress]);

  // Handle address selection change
  const handleAddressChange = (selectedOption) => {
    if (selectedOption) {
      const selected = address.find((addr) => addr.id === selectedOption.value);
      setCurrentAddress(selected);
      setSelectedAddressId(selectedOption.value);
    } else {
      // Reset to first address if cleared
      if (address && address.length > 0) {
        setCurrentAddress(address[0]);
        setSelectedAddressId(address[0].id);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle phone change
  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  // Handle country change
  const handleCountryChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      country: selectedOption ? selectedOption.value : "",
      state: "",
      city: "",
    }));

    // Load states for selected country
    if (selectedOption) {
      const countryStates = State.getStatesOfCountry(selectedOption.value);
      setStates(
        countryStates.map((state) => ({
          value: state.isoCode,
          label: state.name,
        }))
      );
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  };

  // Handle state change
  const handleStateChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      state: selectedOption ? selectedOption.value : "",
      city: "",
    }));

    // Load cities for selected state
    if (selectedOption && formData.country) {
      const stateCities = City.getCitiesOfState(formData.country, selectedOption.value);
      setCities(
        stateCities.map((city) => ({
          value: city.name,
          label: city.name,
        }))
      );
    } else {
      setCities([]);
    }
  };

  // Handle city change
  const handleCityChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      city: selectedOption ? selectedOption.value : "",
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare update data - only include changed fields
      const userUpdateData = {};
      const addressUpdateData = {};

      // Check user fields
      if (formData.name && formData.name !== user?.userName) {
        userUpdateData.name = formData.name;
      }

      // Check address fields
      if (currentAddress) {
        if (formData.phone && formData.phone !== currentAddress.phone) {
          addressUpdateData.phone = formData.phone;
        }
        if (formData.line1 && formData.line1 !== currentAddress.line1) {
          addressUpdateData.line1 = formData.line1;
        }
        if (formData.line2 !== currentAddress.line2) {
          addressUpdateData.line2 = formData.line2;
        }
        if (formData.country && formData.country !== currentAddress.country) {
          addressUpdateData.country = formData.country; // Store ISO code
        }
        if (formData.state && formData.state !== currentAddress.state) {
          addressUpdateData.state = formData.state; // Store ISO code
        }
        if (formData.city && formData.city !== currentAddress.city) {
          addressUpdateData.city = formData.city; // Store city name
        }
        if (formData.postalCode && formData.postalCode !== currentAddress.postalCode) {
          addressUpdateData.postalCode = formData.postalCode;
        }
      }

      // Make API calls only if there are changes
      const promises = [];

      if (Object.keys(userUpdateData).length > 0) {
        promises.push(
          axios.patch(`${baseUrl}/users/update`, userUpdateData, {
            withCredentials: true,
          })
        );
      }

      if (Object.keys(addressUpdateData).length > 0 && currentAddress) {
        promises.push(
          axios.patch(
            `${baseUrl}/address/update/${currentAddress.id}`,
            addressUpdateData,
            {
              withCredentials: true,
            }
          )
        );
      }

      if (promises.length === 0) {
        toast.info("No changes to save");
        setIsSubmitting(false);
        return;
      }

      // Execute all updates
      const results = await Promise.all(promises);

      // // Update store with new data
      // results.forEach((result) => {
      //   if (result.data.success) {
      //     // Check if it's a user update or address update
      //     if (result.data.data.userName || result.data.data.email) {
      //       // User update
      //     } else if (result.data.data.line1) {
      //       // Address update
      //       const updatedAddresses = address.map((addr) =>
      //         addr.id === result.data.data.id ? result.data.data : addr
      //       );
      //       setCurrentAddress(result.data.data);
      //     }
      //   }
      // });

      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update settings";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.userName || "",
        email: user.email || "",
      }));
    }

    if (currentAddress) {
      const country = Country.getAllCountries().find(
        (c) => c.isoCode === currentAddress.country || c.name === currentAddress.country
      );
      const state = country
        ? State.getStatesOfCountry(country.isoCode).find(
            (s) => s.isoCode === currentAddress.state || s.name === currentAddress.state
          )
        : null;

      setFormData((prev) => ({
        ...prev,
        phone: currentAddress.phone || "",
        line1: currentAddress.line1 || "",
        line2: currentAddress.line2 || "",
        country: country?.isoCode || currentAddress.country || "",
        state: state?.isoCode || currentAddress.state || "",
        city: currentAddress.city || "",
        postalCode: currentAddress.postalCode || "",
      }));
    }
  };

  // Custom styles for react-select to match design system
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "var(--color-white)",
      borderColor: state.isFocused
        ? "var(--border-primary)"
        : "var(--border-default)",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(79, 126, 255, 0.1)" : "none",
      "&:hover": {
        borderColor: "var(--border-primary)",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--color-brand-primary)"
        : state.isFocused
        ? "var(--bg-surface)"
        : "var(--color-white)",
      color: state.isSelected ? "var(--color-white)" : "var(--text-primary)",
      padding: "0.75rem 1rem",
      cursor: "pointer",
    }),
  };

  // Get display values for selects
  const getCountryDisplayValue = () => {
    if (!formData.country) return null;
    const country = countries.find((c) => c.value === formData.country);
    return country || null;
  };

  const getStateDisplayValue = () => {
    if (!formData.state) return null;
    const state = states.find((s) => s.value === formData.state);
    return state || null;
  };

  const getCityDisplayValue = () => {
    if (!formData.city) return null;
    return { value: formData.city, label: formData.city };
  };

  return (
    <section className="pb-12">
      <DashboardHeadingBox
        text="Settings"
        subHeading={
          "Manage your account settings, including profile, security, and preferences. Customize your online shopping experience with ease."
        }
      />

      {/* Profile Settings Card */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Profile Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your profile information, such as name, email, phone number,
              and address.
            </p>
          </div>

          {/* Form Content */}
          <form className="px-8 py-8" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="w-full px-4 py-3 rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 bg-gray-50"
                    placeholder="Enter your email"
                    readOnly
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed for security reasons
                  </p>
                </div>

                {/* Phone Field */}
                {currentAddress && (
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <PhoneInput
                      containerStyle={{ width: "100%" }}
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        fontSize: "16px",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      enableSearch={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Settings;