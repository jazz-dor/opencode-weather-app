import { stdout } from "node:process";

const ESC = "\x1b[";

function isEnabled(): boolean {
  return Boolean(stdout.isTTY) && !("NO_COLOR" in process.env);
}

function wrap(code: number, text: string): string {
  return isEnabled() ? `${ESC}${code}m${text}${ESC}0m` : text;
}

function wrap256(code: number, text: string): string {
  return isEnabled() ? `${ESC}38;5;${code}m${text}${ESC}0m` : text;
}

export const white = (text: string): string => wrap(37, text);
export const blue = (text: string): string => wrap(34, text);
export const green = (text: string): string => wrap(32, text);
export const red = (text: string): string => wrap(31, text);
export const yellow = (text: string): string => wrap(33, text);
export const cyan = (text: string): string => wrap(36, text);
export const orange = (text: string): string => wrap256(208, text);
