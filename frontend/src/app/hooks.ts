/**
 * Typed Redux hooks.
 *
 * Always use these instead of the plain `useDispatch` / `useSelector`
 * so TypeScript can infer RootState and AppDispatch automatically.
 */
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
