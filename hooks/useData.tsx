// react
import { FC, useState, useEffect, createContext, useContext } from 'react';

// firebase
import {
  getDatabase,
  ref,
  onValue,
  push,
  child,
  update,
  off,
} from "firebase/database";

// utils
import { Data, Firebase, Models } from '../utils/types';
import { db } from '../utils/Firebase';
import { pop } from '../utils/Helper';

function decompressQItems<D extends Models.Identifiable>(
  items: Record<string, number> | undefined, data: D[]
) {
  const decompressedItems: (D & Models.Quantified)[] = [];

  if (!items) {
    items = {};
  }

  for (const [itemID, quantity] of Object.entries(items)) {
    const item = data.find(d => d.id === itemID);

    if (!item) {
      continue;
    }
    decompressedItems.push({ quantity: quantity, ...item });
  }
  return decompressedItems;
}

function compressQItems<D extends Models.Identifiable>(
  items: (D & Models.Quantified)[]
) {
  const unProcItems: Record<string, number> = {};
  for (const item of items) {
    unProcItems[item.id] = item.quantity;
  }
  return unProcItems;
}

function decompressItems<T>(items: Record<string, T>) {
  // cast firebase datatype to Data datatype
  const itemsWithId: (T & Models.Identifiable)[] = [];

  for (const [id, item] of Object.entries(items)) {
    itemsWithId.push({
      ...item,
      id: id
    });
  }
  return itemsWithId;
}

function compressItems<T extends Models.Identifiable>(items: T[]) {
  const rawItems: Record<string, Omit<T, "id">> = {};

  for (const item of items) {
    rawItems[item.id] = pop(item, "id");
  }
  return rawItems;
}

function decompressMenus(dishes: Data.Plat[], rawMenus: Firebase.DB.Menus) {
  const menus: Data.Menu[] = [];

  for (const id of Object.keys(rawMenus)) {
    const rawMenu = rawMenus[id];

    const decompressedDishes = decompressQItems(rawMenu.dishes, dishes);

    menus.push({
      id: id,
      name: rawMenu.name,
      price: rawMenu.price,
      plats: decompressedDishes,
    });
  }

  return menus;
}

function decompressQuantifiedMenus(
  rawMenus: Record<string, Firebase.DB.QMenu> | undefined, dishes: Data.Plat[]) {

  const menus: (Data.Menu & Models.Quantified)[] = [];

  if (!rawMenus) {
    rawMenus = {};
  }

  for (const id of Object.keys(rawMenus)) {
    const rawMenu = rawMenus[id];

    const decompressedDishes = decompressQItems(rawMenu.dishes, dishes);

    menus.push({
      id: id,
      name: rawMenu.name,
      quantity: rawMenu.quantity,
      price: rawMenu.price,
      plats: decompressedDishes,
    });
  }

  return menus;
}

function decompressDishes(materials: Data.Material[], rawDishes: Firebase.DB.Dishes) {
  const dishes: Data.Plat[] = [];

  for (const id of Object.keys(rawDishes)) {
    const rawDish = rawDishes[id];

    const decompressedDishes = decompressQItems(rawDish.materials, materials);

    dishes.push({
      id: id,
      name: rawDish.name,
      price: rawDish.price,
      category: rawDish.category,
      categorization: rawDish.categorization ?? [],
      season: rawDish.season,
      materials: decompressedDishes,
    });
  }

  return dishes;
}

function decompressEvents(
  clients: Data.Client[], materials: Data.Material[],
  plats: Data.Plat[], drinks: Data.Drink[],
  config: Data.Config, rawEvents: Firebase.DB.Events
) {
  const events: Data.Event[] = [];

  for (const id of Object.keys(rawEvents)) {
    const rawEvent = rawEvents[id];

    // clients
    const client = clients.find(c => c.id === rawEvent.clientID);
    if (!client) {
      continue;
    }

    // departure address
    const departure = config.addresses.find(a => a.id === rawEvent.departureID);
    if (!departure) {
      continue;
    }

    // decompress labels
    const labels = (rawEvent.labels ?? [])
      .map((id) => (config.labels.find(label => label.id === id)))
      .filter((label) => label) as Data.Label[];

    const decompressedMenus = decompressQuantifiedMenus(rawEvent.menus, plats);
    const decompressedMaterials = decompressQItems(rawEvent.materials, materials);
    const decompressedDrinks = decompressQItems(rawEvent.drinks, drinks);

    events.push({
      id: id,
      date: rawEvent.date,
      status: rawEvent.status,
      labels: labels,
      price: rawEvent.price,
      comment: rawEvent.comment,
      address: rawEvent.address,
      departure: departure,
      people: rawEvent.people,
      client: client,
      distance: rawEvent.distance,
      type: rawEvent.type,
      menus: decompressedMenus,
      materials: decompressedMaterials,
      drinks: decompressedDrinks,
      delivery: rawEvent.delivery,
      returnDelivery: rawEvent.returnDelivery,
      service: rawEvent.service,
    });

  }
  return events;
}

function compressMenus(menus: Data.Menu[]) {
  const rawMenus: Firebase.DB.Menus = {};

  for (const menu of menus) {
    const dishes = compressQItems(menu.plats);
    rawMenus[menu.id] = {
      name: menu.name,
      price: menu.price,
      dishes: dishes,
    };
  }
  return rawMenus;
}

function compressQuantifiedMenus(menus: (Data.Menu & Models.Quantified)[]) {
  const rawMenus: Record<string, Firebase.DB.QMenu> = {};

  for (const menu of menus) {
    const dishes = compressQItems(menu.plats);
    rawMenus[menu.id] = {
      name: menu.name,
      price: menu.price,
      quantity: menu.quantity,
      dishes: dishes,
    };
  }
  return rawMenus;
}

function compressDishes(dishes: Data.Plat[]) {
  const rawDishes: Firebase.DB.Dishes = {};

  for (const dish of dishes) {
    const materials = compressQItems(dish.materials);
    rawDishes[dish.id] = {
      name: dish.name,
      price: dish.price,
      category: dish.category,
      categorization: dish.categorization,
      season: dish.season,
      materials: materials,
    };
  }
  return rawDishes;
}

function compressEvents(events: Data.Event[]) {
  const rawEvents: Firebase.DB.Events = {};

  for (const event of events) {
    const labels = event.labels.map((label) => label.id);

    const menus = compressQuantifiedMenus(event.menus);
    const materials = compressQItems(event.materials);
    const drinks = compressQItems(event.drinks);
    rawEvents[event.id] = {
      date: event.date,
      status: event.status,
      labels: labels,
      price: event.price,
      comment: event.comment,
      address: event.address,
      departureID: event.departure.id,
      people: event.people,
      clientID: event.client.id,
      distance: event.distance,
      type: event.type,
      menus: menus,
      materials: materials,
      drinks: drinks,
      delivery: event.delivery,
      returnDelivery: event.returnDelivery,
      service: event.service,
    };
  }
  return rawEvents;
}

/**
 * Cast and add values to updates,
 * if needed create a new key.  
 * Return the keys of all given values
 */
function addValuesToUpdates<T extends { id?: string }>(
  updates: Record<string, any>, path: string, values: T[]
) {
  const keys: string[] = [];
  for (const value of values) {

    // remove id from value
    const { id, ...rawValue } = value;

    // if no id is given -> create a new one on db
    const key = id ?? push(child(ref(db), path)).key as string;
    keys.push(key);

    updates[`${path}/${key}`] = rawValue;
  }
  return keys;
}

function useDataRoot(): Firebase.DataHook {
  const [config, setConfig] = useState<Data.Config>({
    appTitle: "",
    transportCosts: {
      under: 0,
      upper: 0,
      threshold: 0,
    },
    wagesServer: 0,
    wagesCook: 0,
    defaultStatus: "Cancelled",
    addresses: [],
    labelsStatus: [],
    labels: [],
    categoriesSorted: [],
  });
  const [clients, setClients] = useState<Data.Client[]>([]);
  const [events, setEvents] = useState<Data.Event[]>([]);
  const [dishes, setDishes] = useState<Data.Plat[]>([]);
  const [menus, setMenus] = useState<Data.Menu[]>([]);
  const [materials, setMaterials] = useState<Data.Material[]>([]);
  const [drinks, setDrinks] = useState<Data.Drink[]>([]);

  const [rawDishes, setRawDishes] = useState<Firebase.DB.Dishes>({});
  const [rawMenus, setRawMenus] = useState<Firebase.DB.Menus>({});
  const [rawEvents, setRawEvents] = useState<Firebase.DB.Events>({});

  // used to recall the useEffect that defines all the event listener
  const [uniqueID, setUniqueID] = useState(0);

  // keep track of number of received data
  const [readys, setReadys] = useState({
    config: false,
    clients: false,
    events: false,
    dishes: false,
    menus: false,
    materials: false,
    drinks: false,
    /**Internal purpose -> decompress dishes */
    rawDishes: false,
    /**Internal purpose -> decompress menus */
    rawMenus: false,
    /**Internal purpose -> decompress events */
    rawEvents: false,
  });


  useEffect(() => {

    const db = getDatabase();

    const refClients = ref(db, "clients");
    onValue(refClients, (snapshot) => {
      const raw: Firebase.DB.Clients | null = snapshot.val();
      readys.clients = true;

      // clients is null if no client is in the db
      if (raw === null) {
        setClients([]);
        return;
      }

      // cast firebase datatype to Data datatype
      const data: Data.Client[] = Object.keys(raw).map(
        (key) => ({ id: key, ...raw[key] })
      );

      setClients(data);
    });

    const refDrinks = ref(db, "drinks");
    onValue(refDrinks, (snapshot) => {
      const raw: Firebase.DB.Drinks | null = snapshot.val();
      readys.drinks = true;

      // drinks is null if no drink is in the db
      if (raw === null) {
        setDrinks([]);
        return;
      }

      // cast firebase datatype to Data datatype
      const data: Data.Drink[] = Object.keys(raw).map(
        (key) => ({ id: key, ...raw[key] })
      );

      setDrinks(data);
    });

    const refMaterials = ref(db, "materials");
    onValue(refMaterials, (snapshot) => {
      const raw: Firebase.DB.Materials | null = snapshot.val();
      readys.materials = true;

      // materials is null if no material is in the db
      if (raw === null) {
        setMaterials([]);
        return;
      }

      // cast firebase datatype to Data datatype
      const data: Data.Material[] = Object.keys(raw).map(
        (key) => ({ id: key, ...raw[key] })
      );

      setMaterials(data);
    });

    const refConfig = ref(db, "config");
    onValue(refConfig, (snapshot) => {
      const data: Firebase.DB.Config | null = snapshot.val();

      // if config is null there is a serious problem
      if (data === null) {
        alert("A critical problem has been detected with the database.");
        return;
      }

      // extract labels & default label
      const labels = decompressItems(data.labels ?? {});

      setConfig({
        ...data,
        addresses: decompressItems(data.addresses ?? {}),
        labelsStatus: labels.filter(l => l.status) as Data.LabelStatus[],
        labels: labels.filter(l => !l.status),
      });
      readys.config = true;
    });

    const refDishes = ref(db, "dishes");
    onValue(refDishes, (snapshot) => {
      const raw: Firebase.DB.Dishes | null = snapshot.val();
      readys.rawDishes = true;

      // rawDishes is null if no menu is in the db
      if (raw === null) {
        setRawDishes({});
        return;
      }
      setRawDishes(raw);
    });

    const refMenus = ref(db, "menus");
    onValue(refMenus, (snapshot) => {
      const raw: Firebase.DB.Menus | null = snapshot.val();
      readys.rawMenus = true;

      // rawMenus is null if no menu is in the db
      if (raw === null) {
        setRawMenus({});
        return;
      }
      setRawMenus(raw);

    });

    const refEvents = ref(db, "events");
    onValue(refEvents, (snapshot) => {
      const raw: Firebase.DB.Events | null = snapshot.val();
      readys.rawEvents = true;

      // rawEvents is null if no menu is in the db
      if (raw === null) {
        setRawEvents({});
        return;
      }
      setRawEvents(raw);
    });

  }, [uniqueID]);

  // construct events
  useEffect(() => {

    if (readys.clients
      && readys.materials
      && readys.dishes
      && readys.drinks
      && readys.config
      && readys.rawEvents
    ) {
      const events = decompressEvents(clients, materials, dishes, drinks, config, rawEvents);
      setEvents(events);
      readys.events = true;
    }
  }, [clients, materials, dishes, drinks, config, rawEvents]);

  // construct menus
  useEffect(() => {
    if (readys.dishes && readys.rawMenus) {
      const menus = decompressMenus(dishes, rawMenus);
      setMenus(menus);
      readys.menus = true;
    }
  }, [dishes, rawMenus]);

  // construct dishes
  useEffect(() => {
    if (readys.materials && readys.rawDishes) {
      const dishes = decompressDishes(materials, rawDishes);
      setDishes(dishes);
      readys.dishes = true;
    }
  }, [materials, rawDishes]);

  /**
   * Takes any of the db root fields (ex: events, drinks...)  
   * Will push every given item to the db,
   * will create an new item if the id is undefined.  
   * Return the keys of the pushed items.
   * 
   * Example:  
   * ```
   * update({
   *  clients: [client1],
   *  drinks: [newDrink, drink1]
   * });
   * ```
   * This will update client1 & drink1,
   * and create a new drink element "newDrink" in the db.  
   * It will return:
   * ```
   * {
   *  clients: [clientId1],
   *  drinks: [newId, drinkId1],
   * }
   * ```
   */
  const updateDB = (data: Partial<Firebase.DataNotIdentifiable>) => {

    const updates: Record<string, any> = {};
    const keys: Firebase.UpdatedKeys = {};

    if (data.clients) {
      keys.clients = addValuesToUpdates(updates, "clients", data.clients);
    }
    if (data.drinks) {
      keys.drinks = addValuesToUpdates(updates, "drinks", data.drinks);
    }
    if (data.materials) {
      keys.materials = addValuesToUpdates(updates, "materials", data.materials);
    }

    if (data.config) {
      keys.config = {};

      if (data.config.appTitle) {
        updates[`config/appTitle`] = data.config.appTitle;
      }
      if (data.config.transportCosts) {
        updates[`config/transportCosts`] = data.config.transportCosts;
      }
      if (data.config.wagesCook) {
        updates[`config/wagesCook`] = data.config.wagesCook;
      }
      if (data.config.wagesServer) {
        updates[`config/wagesServer`] = data.config.wagesServer;
      }
      if (data.config.defaultStatus) {
        updates[`config/defaultStatus`] = data.config.defaultStatus;
      }
      if (data.config.categoriesSorted) {
        updates[`config/categoriesSorted`] = data.config.categoriesSorted;
      }

      if (data.config.addresses) {
        keys.config.addresses = [];

        // update existing addresses
        const oldAddresses = data.config.addresses.filter(p => p.id) as Data.AddressLocation[];
        const rawAddresses = compressItems(oldAddresses);
        for (const [key, raw] of Object.entries(rawAddresses)) {
          updates[`config/addresses/${key}`] = raw;
          keys.config.addresses.push(key);
        }

        // add new addresses
        const newAddresses = data.config.addresses
          .filter(p => !p.id)
          .map(p => pop(p, "id")) as Omit<Data.AddressLocation, "id">[];

        for (const address of newAddresses) {
          const key = push(child(ref(db), "config/addresses")).key as string;

          updates[`config/addresses/${key}`] = address;
          keys.config.addresses.push(key);
        }
      }

      if (data.config.labels) {
        keys.config.labels = [];

        // update existing labels
        const oldLabels = data.config.labels.filter(p => p.id) as Data.Label[];
        const rawLabels = compressItems(oldLabels);
        for (const [key, raw] of Object.entries(rawLabels)) {
          updates[`config/labels/${key}`] = raw;
          keys.config.labels.push(key);
        }

        // add new labels
        const newLabels = data.config.labels
          .filter(p => !p.id)
          .map(p => pop(p, "id")) as Omit<Data.Label, "id">[];

        for (const address of newLabels) {
          const key = push(child(ref(db), "config/labels")).key as string;

          updates[`config/labels/${key}`] = address;
          keys.config.labels.push(key);
        }
      }

      if (data.config.labelsStatus) {
        keys.config.labelsStatus = [];

        // update labels
        const rawLabels = compressItems(data.config.labelsStatus);
        for (const [key, raw] of Object.entries(rawLabels)) {
          updates[`config/labels/${key}`] = raw;
          keys.config.labelsStatus.push(key);
        }
      }

      // check if an address/label is updated
      if (Object.keys(keys.config).length == 0) {
        delete keys.config;
      }
    }

    if (data.plats) {
      keys.plats = [];

      // update existing dishes
      const oldDishes = data.plats.filter(p => p.id) as Data.Plat[];
      const rawDishes = compressDishes(oldDishes);
      for (const [key, raw] of Object.entries(rawDishes)) {
        updates[`dishes/${key}`] = raw;
        keys.plats.push(key);
      }

      // add new dishes
      const newDishes = data.plats.filter(p => !p.id) as Omit<Data.Plat, "id">[];

      for (const dish of newDishes) {
        const key = push(child(ref(db), "dishes")).key as string;

        const materials = compressQItems(dish.materials);
        const raw: Firebase.DB.Dish = {
          name: dish.name,
          price: dish.price,
          category: dish.category,
          season: dish.season,
          materials: materials,
        };

        updates[`dishes/${key}`] = raw;
        keys.plats.push(key);
      }
    }

    if (data.menus) {
      keys.menus = [];

      // update existing menus
      const oldMenus = data.menus.filter(m => m.id) as Data.Menu[];
      const rawMenus = compressMenus(oldMenus);
      for (const [key, raw] of Object.entries(rawMenus)) {
        updates[`menus/${key}`] = raw;
        keys.menus.push(key);
      }

      // add new menus
      const newMenus = data.menus.filter(m => !m.id) as Omit<Data.Menu, "id">[];

      for (const menu of newMenus) {
        const key = push(child(ref(db), "menus")).key as string;

        const dishes = compressQItems(menu.plats);
        const raw: Omit<Firebase.DB.Menu, "id"> = {
          name: menu.name,
          price: menu.price,
          dishes: dishes,
        };

        updates[`menus/${key}`] = raw;
        keys.menus.push(key);
      }
    }

    if (data.events) {
      keys.events = [];

      // update existing events
      const oldEvents = data.events.filter(m => m.id) as Data.Event[];
      const rawEvents = compressEvents(oldEvents);
      for (const [key, raw] of Object.entries(rawEvents)) {
        updates[`events/${key}`] = raw;
        keys.events.push(key);
      }

      // add new events
      const newEvents = data.events.filter(m => !m.id) as Omit<Data.Event, "id">[];

      for (const event of newEvents) {
        const key = push(child(ref(db), "events")).key as string;

        const labels = event.labels.map((label) => label.id);

        const menus = compressQuantifiedMenus(event.menus);
        const materials = compressQItems(event.materials);
        const drinks = compressQItems(event.drinks);
        const raw: Firebase.DB.Event = {
          date: event.date,
          status: event.status,
          labels: labels,
          price: event.price,
          comment: event.comment,
          address: event.address,
          departureID: event.departure.id,
          people: event.people,
          clientID: event.client.id,
          distance: event.distance,
          type: event.type,
          menus: menus,
          materials: materials,
          drinks: drinks,
          delivery: event.delivery,
          returnDelivery: event.returnDelivery,
          service: event.service,
        };

        updates[`events/${key}`] = raw;
        keys.events.push(key);
      }
    }

    update(ref(db), updates);
    return keys;
  }

  /**
   * If field is given,
   * reset the specified field.  
   * Otherwise reset all fields (except "config") of the db
   */
  const resetDB = (field?: Exclude<Firebase.DB.Fields, "config">) => {
    const updates: Record<string, null> = {};

    if (field) {
      updates[field] = null;
    } else {
      updates["clients"] = null;
      updates["events"] = null;
      updates["dishes"] = null;
      updates["menus"] = null;
      updates["materials"] = null;
      updates["drinks"] = null;
    }

    update(ref(db), updates);
  }

  /**
   * Reconstruct all the event listener,
   * it will do all the fetch again
   */
  const refetchDB = () => {
    off(ref(db, "clients"));
    off(ref(db, "events"));
    off(ref(db, "dishes"));
    off(ref(db, "menus"));
    off(ref(db, "materials"));
    off(ref(db, "drinks"));
    setUniqueID(uniqueID + 1);
  }

  return {
    data: {
      ready: Object.values(readys).reduce((p, v) => p && v, true),
      config,
      clients,
      events,
      plats: dishes,
      menus,
      materials,
      drinks,
    },
    update: updateDB,
    reset: resetDB,
    refetch: refetchDB,
  }
}

const dataContext = createContext<Firebase.DataHook>({} as Firebase.DataHook);

export interface DataProviderProps {

}

/**
 * Handle firebase database actions
 * Use once at root of app, the use useData
 */
export const DataProvider: FC<DataProviderProps> = (props) => {
  const values = useDataRoot();
  return (
    <dataContext.Provider value={values}>
      {props.children}
    </dataContext.Provider>
  );
}

/** 
 * Return context value (given by DataProvider)
 */
export function useData() {
  return useContext(dataContext);
}