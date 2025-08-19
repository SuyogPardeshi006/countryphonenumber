import React, { useRef, useEffect } from "react";
import "./css/style.css";
import "intl-tel-input/build/css/intlTelInput.css";
import intlTelInput from "intl-tel-input";
const CountryPhoneNumber = () => {
  const phoneInputRef = useRef(null);
  const itiRef = useRef(null);

  useEffect(() => {
    const input = phoneInputRef.current;
    if (input) {
      // Initialize intl-tel-input
      itiRef.current = intlTelInput(input, {
        initialCountry: "in",
        preferredCountries: ["in", "us", "gb"],
        utilsScript:
          "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
      });

      // Allow digits + only
      const handleInput = (e) => {
        // allow digits and one + at the start
        e.target.value = e.target.value
          .replace(/[^\d+]/g, "")
          .replace(/(?!^)\+/g, "");
      };

      input.addEventListener("input", handleInput);

      // Cleanup listener on unmount
      return () => {
        input.removeEventListener("input", handleInput);
      };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const iti = itiRef.current;
    if (!iti) return;

    const phone = iti.getNumber(); // full E.164 format
    const countryData = iti.getSelectedCountryData(); // metadata
    const countryCode = countryData.dialCode; // e.g. "91"
    const iso2 = countryData.iso2.toUpperCase(); // e.g. "IN"

    // Validation
    if (!iti.isValidNumber()) {
      alert("❌ Please enter a valid phone number for the selected country.");
      return;
    }

    if (!/^\+?\d+$/.test(phone)) {
      alert("❌ Phone number must contain only digits.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/phoneNumber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone, // +919876543210
          countryCode, // 91
          country: iso2, // IN
        }),
      });

      if (response.ok) {
        alert("✅ Phone number saved successfully!");
        phoneInputRef.current.value = "";
      } else {
        const errorText = await response.text();
        alert("❌ Error: " + errorText);
      }
    } catch (error) {
      alert("⚠️ Network error: " + error.message);
    }
  };

  return (
    <form id="phoneForm" onSubmit={handleSubmit}>
      <h1 className="text-center pt-2 text-dark">Country Phone Number</h1>

      <div className="d-flex justify-content-center align-items-center">
        <input
          type="tel"
          name="phone"
          id="phone"
          ref={phoneInputRef}
          className="rounded-0"
          placeholder="Phone Number"
          required
        />
      </div>

      <div className="text-center pt-3">
        <button type="submit" className="btn btn-primary rounded-4">
          Submit
        </button>
      </div>
    </form>
  );
};

export default CountryPhoneNumber;
