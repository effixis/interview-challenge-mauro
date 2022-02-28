// mui
import { GridSize } from "@material-ui/core";

// utils
import { InputFieldProps, validateUniqueName } from "./Input";
import { Inputs, Data } from "./types";


// Header definition (used to parameter the table)
export interface HeadCell<T> {
  /**
   * The key of the property to display (the value of the element stored under this key).
   */
  field: keyof T;
  /**
  * The (human friendly) name of the column
  */
  label: string;
  /**
   * The number of columns space (1-12) that the field must take (in the quick form).
   */
  cols?: GridSize;
  /**
   * Object containing additionnal properties for the input.
   * If not defined, no input will be display when the table is in edit mode.
   */
  inputFieldProps?: Partial<InputFieldProps>;
  /**
   * The items to display as rows.
   */
  options?: T[keyof T][];
  /**
   * If true, the displayed value (supposedly a number) is formatted: rounded at 2 digits (e.g. 0.00).
   */
  currency?: boolean
  /**
   * Function used to compute a displayed values (instead of simply using field).
   * Takes the the current item (for each row) and returns a displayed text.
   */
  computeValue?: (e: T) => string
  /**
   * If a computed value is displayed (using the property computeValue), it will also be used for sorting.
   * If the displayed value does not match the natural sorting, compareUsingRaw forces the use of original value (example: for a date).
   */
  compareUsingRaw?: boolean
  /**
   * If the value defined by the property field contains an array, enable the sub-items edition and filtering.
   * The function takes the subitems array as prop and returns a string to display.
   */
  arrayFormatter?: (array: any[]) => string

  /**
   * If the property arrayFormatter is used, defines the palceholder text of the sub-items form (editable list) main input.
   */
  selectLabel?: string
  /**
   * If the property arrayFormatter is used, defines the dispalyed title of the sub-items form (editable list) dialog.
   */
  dialogTitle?: string
  /**
   * If the type is 'select', narrows down the options list.
   * Each element (string) of this array represents a contraint on the options list. 
   * It designates another field (property) in the current item (row).
   * The latter must contain the value typed in the input matching the field.
   * For example, the column 'subcategory' can define ['category'] as skimmedBy value 
   * to filter the subcategory options list based on the current category value.
   */
  skimmedBy?: (keyof T)[]
  /**
   * An object that has the groupsConfig attribute will have its sub-items grouped according to a list stored in data.config. 
   * The attribute groupsConfig designates the key of the config object which contains the list (string array) to order the sub-items. 
   * These sub-items are ordered according to the field attribute (e.g. category) which must match the value of the list. 
   * Mainly used to classify the dishes in the menus.
   */
  groupsConfig?: keyof Data.Config
  /**
   * To be used with arrayFormatter. When the list of sub-elements is modified, it also modifies the price at the controller value level.
   */
  reportPrice?: boolean
  isLabelDot?: boolean
}

export const drinksParams: HeadCell<Data.Drink>[] = [{
  field: 'name',
  label: 'Nom',
  cols: 12,
  inputFieldProps: {
    customValidation: validateUniqueName<Inputs.Drink, Data.Drink>()
  },
}, {
  field: 'category',
  label: 'Catégorie',
  inputFieldProps: {
    type: "select"
  },

}, {
  field: 'subcategory',
  label: 'Sous-catégorie',
  inputFieldProps: {
    type: "select",
  },
  skimmedBy: ["category"]
}, {
  field: 'price',
  label: 'Prix',
  inputFieldProps: {
    type: 'number',
    min: 0
  },
  currency: true
}];

export const materialParams: HeadCell<Data.Material>[] = [{
  field: 'name',
  label: 'Nom',
  cols: 12,
  inputFieldProps: {
    customValidation: validateUniqueName<Inputs.Material, Data.Material>()
  },
}, {
  field: 'category',
  label: 'Catégorie',
  inputFieldProps: {
    type: "select"
  },
}, {
  field: 'subcategory',
  label: 'Sous-catégorie',
  inputFieldProps: {
    type: "select",
  },
  skimmedBy: ["category"]
}, {
  field: 'batch',
  label: 'Lot',
  inputFieldProps: {
    type: 'number',
    min: 0,
  },
}, {
  field: 'price',
  label: 'Prix',
  inputFieldProps: {
    type: 'number',
    min: 0,
  },
  currency: true,
}];

export const platsParams: HeadCell<Data.Plat>[] = [{
  field: 'name',
  label: 'Nom',
  cols: 12,
  inputFieldProps: {}
}, {
  field: 'category',
  label: 'Catégorie',
  inputFieldProps: {
    type: 'select'
  },
  groupsConfig: 'categoriesSorted'
}, {
  field: 'categorization',
  label: 'Type',
  inputFieldProps: {
    type: "hierarchization"
  },
  skimmedBy: ["category"]
}, {
  label: 'Saison',
  field: 'season',
  inputFieldProps: {
    type: 'select',
  }
}, {
  label: "Matériel",
  field: "materials",
  inputFieldProps: {},
  arrayFormatter: (items: Data.Material[]) => {
    return items.length > 0 ? `${items.length} matériels` : "Aucun"
  },
  selectLabel: "Ajoutez un matériel...",
  dialogTitle: "Filtrer les plats par: Matériel"
}, {
  label: 'Prix',
  field: 'price',
  inputFieldProps: {},
  currency: true
}];

export const menusParams: HeadCell<Data.Menu>[] = [{
  field: 'name',
  label: 'Nom',
  cols: 12,
  inputFieldProps: {
    customValidation: validateUniqueName<Inputs.Menu, Data.Menu>()
  },
}, {
  field: 'plats',
  label: 'Plats',
  inputFieldProps: {},
  arrayFormatter: (items: any[]) => {
    return items.length > 0 ? `${items.length} plat(s)` : "Aucun"
  },
  selectLabel: "Ajoutez un plat...",
  dialogTitle: "Filtrer les menus par: Plat",
  reportPrice: true
}, {
  field: 'price',
  label: 'Prix',
  inputFieldProps: {
    type: 'number',
    min: 0
  },
  currency: true
}];

export const clientsParams: HeadCell<Data.Client>[] = [{
  field: 'name',
  label: 'Nom',
  cols: 12,
  inputFieldProps: {
    customValidation: validateUniqueName<Inputs.Client, Data.Client>()
  },
}, {
  field: 'email',
  label: 'Email',
  inputFieldProps: {}
}, {
  field: 'phone',
  label: 'Téléphone',
  inputFieldProps: {}
}];

export const eventParams: HeadCell<Data.Event>[] = [{
  field: 'status',
  label: '',
  isLabelDot: true
},{
  field: 'date',
  label: 'Date',
  inputFieldProps: {},
  compareUsingRaw: true,
  computeValue: (item: Data.Event) => {
    return new Date(item.date).toLocaleDateString("fr-CH")
  },
}, {
  field: 'client',
  label: 'Client',
  inputFieldProps: {},
  computeValue: (item: Data.Event) => {
    return item.client.name
  },
}, {
  field: 'people',
  label: 'Personnes',
  inputFieldProps: {}
}, {
  label: 'Lieu',
  field: 'address',
  computeValue: (item: Data.Event) => {
    return item.address.town;
  },
  inputFieldProps: {}
}, {
  label: 'Prix',
  field: 'price',
  computeValue: (item: Data.Event) => {
    return Object.values(item.price).reduce(
      (p: number, v: number) => p + v, 0
    ).toFixed(2);
  },
  inputFieldProps: {},
  currency: true
}];

