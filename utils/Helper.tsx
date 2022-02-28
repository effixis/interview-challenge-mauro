// utils
import { Data, Inputs, Models } from "./types";
import { Input } from "./Input";

/**Return if the value is a valide hex color */
export function isColor(value: string) {
  return value.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/g)?.length == 1;
}

export function isNumber(n: unknown) {
  if (typeof n === "string") {
    n = n.replaceAll(",", ".")
  }
  return (!isNaN(Number(n)) && n !== undefined && n !== "");
}

export const formatPrice = (price: string | number | undefined) => {
  return price ? Number(price).toFixed(2) : "";
}

/** Format number to string, by default: keep maximum 2 decimals */
export function formatNumber(n?: unknown, maxDecimals: number = 2) {

  if (typeof n === "string") {
    n = n.replaceAll(",", ".")
  }

  if (!isNumber(n)) {
    return `${n}`;
  }
  return Number(n).toLocaleString(
    undefined,
    { maximumFractionDigits: maxDecimals }
  ).replaceAll(/\s/g, ""); // remove spaces of number > 999
};

/** Enforce type for when ts can't figure it out itself */
export function asType<T>(value: unknown) {
  return value as T;
}

/**
 * Return a copy of the given object except for one field.  
 * DO NOT change the given instance. 
 */
export function pop<T extends {}, K extends keyof T>(value: T, key: K) {
  const result: any = {};
  for (const k of Object.keys(value)) {
    if (k !== key) {
      result[k] = value[k as keyof T];
    }
  }
  return result as Omit<T, K>;
}

export function getPrice<T extends Models.Priced>(items: T[], quantities: number[]) {
  let price = 0;
  for (let i = 0; i < items.length; i++) {
    price += items[i].price * quantities[i];
  }
  return price;
}

/** Return a formatted address composed of all data in Data.Address */
export function getFormattedAddress(value: Data.Address | Data.AddressLocation) {
  return (
    value.address + ", " +
    value.postcode + " " +
    value.town + ", " +
    value.canton
  );
}

/** Typeguard */
export function isArray<T = unknown>(value: T | T[]): value is T[] {
  return (Array.isArray(value));
}

/** Typeguard */
export function isKeyOf<T extends {}>(key: any, obj: T): key is keyof T {
  return key in obj;
}

/** Typeguard */
export function isClient(value: any): value is Data.Client {

  if (value.name === undefined) {
    return false;
  }
  if (value.email === undefined) {
    return false;
  }
  if (value.phone === undefined) {
    return false;
  }

  return true;
}

/** Typeguard */
export function isAddressInput(value: any): value is Input.InputProps<Inputs.Address> {
  if (value.values === undefined) {
    return false;
  }
  if (value.values.postcode === undefined) {
    return false;
  }
  if (value.values.lng !== undefined) {
    return false;
  }

  return true;
}

/** Typeguard */
export function isAddresslocation(value: any): value is Input.InputProps<Data.AddressLocation> {
  if (value.values === undefined) {
    return false;
  }
  if (value.values.address === undefined) {
    return false;
  }
  if (value.values.lng === undefined) {
    return false;
  }

  return true;
}

/**
 * Perform a deep copy using JSON
 * @see https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
 */
export function deepCopy<T>(value: T) {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Takes a list object ('pool') containing two lists: an array of item (stored at key 'target') and an array of quantities.
 * Insert an item into the pool's items list, and add the quantity to the quantities list.
 * 
 * @param target The key to the items list array.
 * @param pool The object containing the lists.
 * @param item The item to insert.
 * @param quantity The item related quantity to insert in the quantities list.
 * @returns An updated copy of the data.
 */
export function addItemToPool<T extends Models.Identifiable>(
  data: (T & Models.Quantified)[], item: T, quantity?: number
) {
  const copy = [...data];
  const existing = copy.find((value) => value.id === item.id);
  if (!existing) {
    copy.push({
      ...item,
      quantity: quantity ?? 1,
    });
  } else {
    existing.quantity += quantity ?? 1;
  }
  return copy;
}