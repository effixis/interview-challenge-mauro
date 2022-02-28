// utils
import { Inputs } from './types';

export const clientDateDefaultValues: Inputs.ClientDate = {
    client: "",
    email: "",
    phone: "",
    date: new Date(),
    people: 0,
    type: "",
};

export const addressDefaultValues: Inputs.Address = {
    placeID: "",
    address: "",
    postcode: 0,
    town: "",
    canton: "",
    distance: 0,
    duration: "",
    price: 0,
    delivery: true,
    returnDelivery: false,
    departureID: "",
};

export const commentDefaultValues: Inputs.Comment = {
    comment: "",
};

export const menuDefaultValues: Inputs.Menu = {
    id: undefined,
    name: "",
    price: 0,
    plats: [],
};

export const menusDefaultValues: Inputs.Menus = {
    menus: [],
    price: 0,
};

export const materialDefaultValues: Inputs.Material = {
    id: undefined,
    name: "",
    category: "",
    subcategory: "",
    batch: 0,
    price: 0
};

export const materialsDefaultValues: Inputs.Materials = {
    materials: [],
    price: 0,
};

export const drinkDefaultValues: Inputs.Drink = {
    id: undefined,
    name: "",
    category: "",
    subcategory: "",
    price: 0,
};

export const drinksDefaultValues: Inputs.Drinks = {
    drinks: [],
    price: 0,
};

export const platDefaultValues: Inputs.Plat = {
    id: undefined,
    name: "",
    category: "",
    categorization: [],
    season: "",
    price: 0,
    materials: [],
};

export const platsDefaultValues: Inputs.Plats = {
    plats: [],
    price: 0
};

export const serviceDefaultValues: Inputs.Service = {
    serversN: 0,
    serversDuration: 0,
    cooksN: 0,
    cooksDuration: 0,
    price: 0
};