/**
 * This file contains common utility functions for the authentication feature.
 * These functions can be used across different components and pages within the authentication feature.
 */

export const userUtils = {
  /**
   * Extracts the initials from a user's full name.
   * @param name - The full name of the user.
   * @returns The initials of the user in uppercase. If the name is empty or undefined, returns "U" as a default.
   */
  getUserInitials(name?: string): string {
    if (!name) return "U"; // Default to "U" if no name is available
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  },
};
