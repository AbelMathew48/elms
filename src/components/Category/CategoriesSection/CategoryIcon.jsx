/**
 * components/categories/CategoryIcon.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * PURPOSE:
 *   Renders the correct react-icons icon based on the `iconName` string
 *   stored in the data layer (categoriesData.js).
 *
 *   Mapping is maintained here so the data layer stays icon-library-agnostic.
 *   To add a new icon: import it above and add a mapping entry below.
 *
 * PROPS:
 *   iconName (string) — Icon identifier matching keys in `iconMap`
 *   size     (string) — CSS font-size value passed to the icon (default '2rem')
 *   color    (string) — CSS colour value for the icon (default 'inherit')
 *
 * USAGE:
 *   <CategoryIcon iconName="FaLaptopCode" size="2.5rem" color="#6c3de8" />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import {
  FaLaptopCode,
  FaPenNib,
  FaBullhorn,
  FaCamera,
  FaPalette,
  FaChartLine,
  FaMusic,
  FaFeatherAlt,
  FaCube,
  FaCouch,
  FaImages,
  FaDraftingCompass,
  FaDatabase,
  FaShieldAlt,
  FaCloud,
  FaRobot,
  FaBriefcase,
  FaUserGraduate,
} from 'react-icons/fa';

/* ── Icon Registry ───────────────────────────────────────── */
/**
 * Maps string keys (stored in data layer) to actual icon components.
 * Add new entries here when new categories are introduced.
 */
const iconMap = {
  FaLaptopCode,
  FaPenNib,
  FaBullhorn,
  FaCamera,
  FaPalette,
  FaChartLine,
  FaMusic,
  FaFeatherAlt,
  FaCube,
  FaCouch,
  FaImages,
  FaDraftingCompass,
  FaDatabase,
  FaShieldAlt,
  FaCloud,
  FaRobot,
  FaBriefcase,
  FaUserGraduate,
};

/* ── Component ───────────────────────────────────────────── */
/**
 * CategoryIcon
 * Renders a dynamic icon based on the iconName string prop.
 *
 * @param {string} iconName - Key in the iconMap registry
 * @param {string} size     - Icon size (CSS font-size), default '2rem'
 * @param {string} color    - Icon colour, default 'currentColor'
 */
const CategoryIcon = ({ iconName, size = '2rem', color = 'currentColor' }) => {
  const IconComponent = iconMap[iconName];

  /* Guard: if icon not found, render a fallback placeholder */
  if (!IconComponent) {
    console.warn(`CategoryIcon: icon "${iconName}" not found in iconMap.`);
    return <span aria-hidden="true" style={{ fontSize: size, color }}>◉</span>;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      aria-hidden="true"
      role="img"
    />
  );
};

export default CategoryIcon;
