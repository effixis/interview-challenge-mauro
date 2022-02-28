
/** Equivalent to Partial utility type but for specific field(s) */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export namespace Calendar {
  export type View = "Week" | "3Days" | "Month";
  export interface EventFilters {
    Cancelled: boolean
    Offer: boolean
    Confirmed: boolean
    [key: string]: boolean
  }
}

export type CalendarView = "Week" | "3Days" | "Month";

export namespace Firebase {
  export type User = {
    id: string
    email: string
  }

  export type Auth = {
    user: User | null
    loading: boolean
  }

  export type DataHook = {
    data: Data.Data & { ready: boolean }
    update: (data: Partial<DataNotIdentifiable>) => UpdatedKeys
    reset: (field?: Exclude<DB.Fields, "config">) => void
    refetch: () => void
  }

  export type GoogleMapPlace = {
    placeID: string
    address: string
    town: string
    canton: string
    postcode: number
    lat: number | null
    lng: number | null
  }

  export type UpdatedKeys = {
    config?: {
      addresses?: string[]
      labels?: string[]
      labelsStatus?: string[]
    }
    clients?: string[]
    events?: string[]
    plats?: string[]
    menus?: string[]
    materials?: string[]
    drinks?: string[]
  }

  export type ConfigNotIdentifiable = {
    appTitle?: string
    transportCosts?: Data.TransportCosts
    wagesServer?: number
    wagesCook?: number
    defaultStatus?: Data.EventStatus
    addresses?: Optional<Data.AddressLocation, "id">[]
    /** Can't add new labels */
    labelsStatus?: Data.LabelStatus[]
    labels?: Optional<Data.Label, "id">[]
    categoriesSorted?: string[]
  }

  /**
   * Same as Data.Data except that "id" is optional
   */
  export type DataNotIdentifiable = {
    config: ConfigNotIdentifiable
    clients: Optional<Data.Client, "id">[]
    events: Optional<Data.Event, "id">[]
    plats: Optional<Data.Plat, "id">[]
    menus: Optional<Data.Menu, "id">[]
    materials: Optional<Data.Material, "id">[]
    drinks: Optional<Data.Drink, "id">[]
  }

  /**
   * Data structure of the data in Firebase realtime database,
   * not used as is (see instead Data)
   */
  export namespace DB {

    export type Fields = "config"
      | "clients"
      | "events"
      | "dishes"
      | "menus"
      | "materials"
      | "drinks"

    export type Clients = Record<string, Omit<Data.Client, "id">>
    export type Drinks = Record<string, Omit<Data.Drink, "id">>
    export type Materials = Record<string, Omit<Data.Material, "id">>
    export type Dishes = Record<string, Dish>
    export type Menus = Record<string, Menu>
    export type Events = Record<string, Event>

    export type Config = {
      appTitle: string
      transportCosts: Data.TransportCosts
      wagesServer: number
      wagesCook: number
      defaultStatus: Data.EventStatus
      addresses?: Record<string, Omit<Data.AddressLocation, "id">>
      labels?: Record<string, Label>
      categoriesSorted: string[]
    }

    export type Label = {
      name: string
      status?: Data.EventStatus
      color: string
    }

    export type Dish = {
      name: string
      price: number
      category: string
      categorization?: string[]
      season: string
      materials?: Record<string, number>
    }

    export type Menu = {
      name: string
      price: number
      dishes?: Record<string, number>
    }

    /** Quantified menu without id */
    export type QMenu = {
      name: string
      price: number
      quantity: number
      dishes?: Record<string, number>
    }

    export type Event = {
      date: string
      status: Data.EventStatus
      labels: string[]
      price: Data.EventPrice
      comment: string
      address: Data.Address
      /** id of one of config.addresses */
      departureID: string
      people: number
      clientID: string
      distance: number
      type: string
      menus?: Record<string, QMenu>
      materials?: Record<string, number>
      drinks?: Record<string, number>
      delivery: boolean
      returnDelivery: boolean
      service: Data.EventService
    }
  }
}

export namespace Models {

  export type Quantified = {
    id: string
    quantity: number
  }

  export type Priced = {
    price: number
  }

  export type Named = {
    name: string
  }

  export type Identifiable = {
    id: string
  }

  export type Unique = {
    id: string
    name: string
  }

  export type Editable = {
    id: string
    name: string
    price: number
  }

  export type Item = {
    id: string
    name: string
    quantity: number
    price: number
  }
}

export namespace Data {

  export type Data = {
    config: Config
    clients: Client[]
    events: Event[]
    plats: Plat[]
    menus: Menu[]
    materials: Material[]
    drinks: Drink[]
  }

  export type AddressLocation = {
    /** db id */
    id: string
    /** Google maps id of the place */
    placeID: string
    address: string
    postcode: number
    town: string
    canton: string
    lat: number
    lng: number
  }
  export type Address = Omit<AddressLocation, "id" | "lat" | "lng">

  export type TransportCosts = {
    under: number
    upper: number
    threshold: number
  }

  export type Config = {
    appTitle: string
    transportCosts: TransportCosts
    wagesServer: number
    wagesCook: number
    defaultStatus: Data.EventStatus
    addresses: AddressLocation[]
    /** should not be removable */
    labelsStatus: LabelStatus[]
    labels: Label[]
    categoriesSorted: string[]
  }

  export type Label = {
    id: string
    name: string
    color: string
  }

  /** Label corresponding to an event status */
  export type LabelStatus = {
    id: string
    name: string
    status: EventStatus
    color: string
  }

  export type EventPrice = {
    menus: number
    transport: number
    service: number
    material: number
    drink: number
  }

  export type EventStatus = "Offer" | "Confirmed" | "Cancelled"

  export type EventService = {
    serversN: number
    serversDuration: number
    cooksN: number
    cooksDuration: number
  }

  export type Event = {
    id: string
    date: string
    status: EventStatus
    labels: Label[]
    price: EventPrice
    comment: string
    /** destination address */
    address: Address
    /** departure address: refers to one of config.addresses */
    departure: AddressLocation
    people: number
    client: Client
    distance: number
    type: string
    menus: (Menu & Models.Quantified)[]
    materials: (Material & Models.Quantified)[]
    drinks: (Drink & Models.Quantified)[]
    delivery: boolean
    returnDelivery: boolean
    service: EventService
  }

  export type Client = {
    id: string
    name: string
    email: string
    phone: string
  }

  export type Menu = {
    id: string
    name: string
    plats: (Plat & Models.Quantified)[]
    price: number
  }

  export type Plat = {
    id: string
    name: string
    price: number
    category: string
    categorization: string[]
    season: string
    materials: (Material & Models.Quantified)[]
  }

  export type Material = {
    id: string
    name: string
    category: string
    subcategory: string
    price: number
    batch: number
  }

  export type Drink = {
    id: string
    name: string
    category: string
    subcategory: string
    price: number
  }
}

export namespace Inputs {
  export type ClientDate = {
    client: string
    email: string
    phone: string
    date: Date
    people: number
    type: string
  }

  export type Address = {
    /** Google maps id of the place */
    placeID: string
    address: string
    postcode: number
    town: string
    canton: string
    distance: number
    /** estimated duration of the route (given by gm api) */
    duration: string
    price: number
    delivery: boolean
    returnDelivery: boolean
    /** db id of the departure address (which is part of config.addresses) */
    departureID: string
  }

  export type AddressLocation = {
    /** db id */
    id?: string
    /** Google maps id of the place */
    placeID: string
    address: string
    postcode: number
    town: string
    canton: string
    lat: number
    lng: number
  }

  export type Comment = {
    comment: string
  }

  export type Options = {
    wagesServer: number
    wagesCook: number
    transportCostsUpper: number
    transportCostsUnder: number
    transportCostsThreshold: number
    defaultStatus: Data.EventStatus
  }

  /** Top level input: a selection of menus */
  export type Menus = {
    menus: (Data.Menu & Models.Quantified)[]
    price: number
  }

  /** Middle level input: a selection of plats  
   * Keep plats and quantities splited, for the input of
   * quantities (see TableEdit)
  */
  export type Menu = Optional<Data.Menu, "id">

  /** Top level input: a selection of materials */
  export type Materials = {
    materials: (Data.Material & Models.Quantified)[]
    price: number
  }

  /**Middle level input: a material */
  export type Material = Optional<Data.Material, "id">

  /** Top level input: a selection of drinks */
  export type Drinks = {
    drinks: (Data.Drink & Models.Quantified)[]
    price: number
  }

  /**Middle level input: a drink */
  export type Drink = Optional<Data.Drink, "id">

  /**Middle level input: a plate */
  export type Plat = Optional<Data.Plat, "id">

  export type Plats = {
    plats: (Data.Plat & Models.Quantified)[]
    price: number
  }

  /**Middle level input: a client */
  export type Client = Optional<Data.Client, "id">

  export type Service = {
    serversN: number
    serversDuration: number
    cooksN: number
    cooksDuration: number
    price: number
  }

  export type Label = Optional<Data.Label, "id">

  export type Labels = {
    status: Data.EventStatus
    labels: Data.Label[]
  }
}