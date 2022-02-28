// react
import { FC, useEffect, useState } from 'react';

// mui
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import EventIcon from '@material-ui/icons/Event';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import RestaurantMenuIcon from '@material-ui/icons/RestaurantMenu';
import RestaurantIcon from '@material-ui/icons/Restaurant';
import EmojiFoodBeverageIcon from '@material-ui/icons/EmojiFoodBeverage';
import PanToolIcon from '@material-ui/icons/PanTool';
import Crop75Icon from '@material-ui/icons/Crop75';
import CropPortraitIcon from '@material-ui/icons/CropPortrait';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import {
  Button,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Tooltip
} from '@material-ui/core';

// utils
import { Inputs, Data, Optional, Models } from '../../utils/types';
import { useInput, validateRequired } from '../../utils/Input';
import { addItemToPool, isNumber, pop } from '../../utils/Helper';
import {
  addressDefaultValues,
  clientDateDefaultValues,
  commentDefaultValues,
  drinksDefaultValues,
  materialsDefaultValues,
  menusDefaultValues,
  serviceDefaultValues
} from '../../utils/defaultValues';

// hooks
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import usePdf from '../../hooks/usePdf';

// components
import { OverviewMenu, OverviewQuickList, TotalLane } from './OverviewLists';
import AddressInputs from './AddressInputs';
import OverviewPanel from '../overview/OverviewPanel';
import OverviewDetailsClient from '../overview/OverviewDetailsClient';
import OverviewDetailsDate from '../overview/OverviewDetailsDate';
import OverviewDetailsOther from '../overview/OverviewDetailsOther';
import OverviewDetailsSpecial from '../overview/OverviewDetailsSpecial';
import BuildService from './BuildService';
import Labels from '../overview/LabelsHandler';

export interface TransferPayload {
  target?: "menu" | "drink" | "material"
  items?: (Data.Menu & Models.Quantified)[]
  | (Data.Drink & Models.Quantified)[]
  | (Data.Material & Models.Quantified)[]
}

const useStyles = makeStyles((theme) => ({
  topLevelActions: {
    display: "flex",
    justifyContent: "flexEnd"
  },
  grandTotalLane: {
    padding: theme.spacing(1)
  },
  leftBtn: {
    marginRight: "auto"
  },
  actionsHeader: {
    alignItems: "center",
    minHeight: "48px"
  },
  customActionsHeader: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(0)
  }
}));

export interface OverviewEditorProps {
  event: Data.Event | null
  editMode?: boolean
  creationMode?: boolean
  transferMode?: boolean
  onChange?: (event: Data.Event | null) => void
  onEditModeChange?: (editMode: boolean) => void
  onClientChange?: (client: Data.Client | null) => void
  onDateChange?: (date: Date) => void
  onTransfer?: (target: TransferPayload["target"], items: TransferPayload["items"]) => void
  transferPayload?: TransferPayload
  onCreate?: (eventId: Optional<Data.Event, "id">) => void
  useBackIcon?: boolean
}

const OverviewEditor: FC<OverviewEditorProps> = (props) => {

  const classes = useStyles();
  const { data, update } = useData();
  const { generatePdf } = usePdf();
  const { generateToast } = useToast();
  const [event, setEvent] = useState<Data.Event | null>(null);
  const [isMaterialLinked, setIsMaterialLinked] = useState(false);

  // initializing the data controllers
  const inputClientDate = useInput<Inputs.ClientDate>(clientDateDefaultValues);
  const inputAddress = useInput<Inputs.Address>(addressDefaultValues);
  const inputComment = useInput<Inputs.Comment>(commentDefaultValues);
  const inputMenus = useInput<Inputs.Menus>(menusDefaultValues);
  const inputMaterials = useInput<Inputs.Materials>(materialsDefaultValues);
  const inputDrinks = useInput<Inputs.Drinks>(drinksDefaultValues);
  const inputService = useInput<Inputs.Service>(serviceDefaultValues);
  const inputLabels = useInput<Inputs.Labels>({
    labels: [],
    status: data.config.defaultStatus,
  });

  // set the departureID as required -> avoid handling unfriendly cases
  inputAddress.criterias.departureID.required = validateRequired();

  // helper functions
  const getTimeDateLabel = (target: 'time' | 'date' | undefined) => {
    const v = inputClientDate.values
    if (v) {
      const d = new Date(v.date)
      if (d) {
        const date = d.toLocaleDateString("fr-CH")
        if (target === "date") return date;
        const time = d.toLocaleTimeString("fr-CH")
        if (target === "time") return time;
        return date + " " + time;
      }
    }
    return "";
  }

  const truncate = (target: string, size: number) => {
    return target.length > size ?
      target.substring(0, size) + '...' :
      target
  }

  const getClientByName = (name: string) => {
    return data.clients.find((c) => c.name === name);
  }

  // updating the local event
  useEffect(() => {
    setLocalEventData(props.event)
  }, [props.event]);

  const setLocalEventData = (event: Data.Event | null) => {
    if (event) {
      // storing the local event
      setEvent(event)
      setDetailsExpanded([]);
      // setting the input controller data
      inputClientDate.setValues({
        client: event.client.name,
        email: event.client.email,
        phone: event.client.phone,
        date: new Date(event.date),
        people: event.people,
        type: event.type,
      });
      inputAddress.setValues({
        placeID: event.address.placeID,
        address: event.address.address,
        postcode: event.address.postcode,
        town: event.address.town,
        canton: event.address.canton,
        distance: event.distance,
        duration: "",
        price: event.price.transport,
        delivery: event.delivery,
        returnDelivery: event.returnDelivery,
        departureID: event.departure.id,
      });
      inputComment.setValues({
        comment: event.comment,
      });
      inputMenus.setValues({
        price: event.price.menus,
        menus: event.menus,
      });
      inputMaterials.setValues({
        price: event.price.material,
        materials: event.materials,
      });
      inputDrinks.setValues({
        price: event.price.drink,
        drinks: event.drinks,
      });
      inputService.setValues({
        ...event.service,
        price: event.price.service,
      });
      inputLabels.setValues({
        labels: event.labels,
        status: event.status,
      });
    }
    else {
      setDetailsExpanded([]);
      resetEvent();
      setEvent(null);
    }

  }

  const validateEvent = () => {
    let success = true;
    if (!inputClientDate.validate()) {
      success = false;
    }
    if (!inputAddress.validate()) {
      success = false;
    }
    if (!inputComment.validate()) {
      success = false;
    }
    if (!inputMenus.validate()) {
      success = false;
    }
    if (!inputMaterials.validate()) {
      success = false;
    }
    if (!inputDrinks.validate()) {
      success = false;
    }
    if (!inputService.validate()) {
      success = false;
    }
    if (!inputLabels.validate()) {
      success = false;
    }
    return success;
  }

  const handleBack = () => {
    if (props.editMode && !props.creationMode && props.onEditModeChange) {
      props.onEditModeChange(false)
    }
    else {
      resetEvent();
    }
  }

  const resetEvent = (softReset = false) => {
    setIsMaterialLinked(false);
    // reset inputs
    inputClientDate.reset();
    inputAddress.reset();
    inputComment.reset();
    inputMenus.reset();
    inputMaterials.reset();
    inputDrinks.reset();
    inputService.reset();
    if (props.onChange && !softReset && data.events.length) {
      props.onChange(null);
    }
  }


  // event db storing
  const extractEventData = (client: Data.Client, id?: string) => {
    const packedEvent: Optional<Data.Event, "id"> = {
      id: id,
      date: new Date(inputClientDate.values.date).toISOString(),
      status: inputLabels.values.status,
      menus: inputMenus.values.menus,
      materials: inputMaterials.values.materials,
      drinks: inputDrinks.values.drinks,
      service: pop(inputService.values, "price"),
      price: {
        menus: inputMenus.values.price,
        transport: inputAddress.values.price,
        service: inputService.values.price,
        material: inputMaterials.values.price,
        drink: inputDrinks.values.price,
      },
      comment: inputComment.values.comment,
      people: inputClientDate.values.people,
      type: inputClientDate.values.type,
      client: client,
      address: {
        placeID: inputAddress.values.placeID,
        address: inputAddress.values.address,
        town: inputAddress.values.town,
        canton: inputAddress.values.canton,
        postcode: inputAddress.values.postcode,
      },
      departure: data.config.addresses.find(
        (a) => (a.id === inputAddress.values.departureID)
      ) as Data.AddressLocation,
      distance: inputAddress.values.distance,
      delivery: inputAddress.values.delivery,
      returnDelivery: inputAddress.values.returnDelivery,
      labels: inputLabels.values.labels,
    };
    return packedEvent;
  }

  const saveEvent = (id?: string) => {

    // running the global validation
    if (!validateEvent()) {
      generateToast("Inputs validation failed.", "error");
      return;
    }

    // getting or creating the client
    let client = getClientByName(inputClientDate.values.client);
    if (!client) {
      // add client to db
      const keys = update({
        clients: [{
          name: inputClientDate.values.client,
          email: inputClientDate.values.email,
          phone: inputClientDate.values.phone,
        }],
      });
      // using the data of the client created on-the-fly
      client = {
        id: keys.clients ? keys.clients[0] : "ERROR",
        name: inputClientDate.values.client,
        email: inputClientDate.values.email,
        phone: inputClientDate.values.phone,
      };
    }

    // push event on db
    const eventData = extractEventData(client, id);
    const response = update({ events: [eventData] });
    if (response.events && response.events.length > 0 && props.onCreate) {
      const event = eventData;
      event.id = response.events[0];
      props.onCreate(event);
    }
    generateToast("Event saved.", "success");
  }

  // panels deployment
  const [expanded, setExpanded] = useState<string[]>(['details', 'order']);
  const [detailsExpanded, setDetailsExpanded] = useState<string[]>([]);
  const [orderExpanded, setOrderExpanded] = useState<string[]>([]);

  const panelsList = {
    details: "Détails",
    order: "Commande",
  }

  const detailsPanelsList = {
    client: "Client",
    date: "Date et heure",
    type: "Taille et Type",
    address: "Adresse",
    specials: "Demandes spéciales"
  }

  const orderPanelsList = {
    menu: "Menus",
    materials: "Matériel",
    drinks: "Boissons",
    services: "Services"
  }

  const openOrderPanel = (e: string) => {
    setExpanded(['order'])
    setDetailsExpanded([])
    setOrderExpanded([e])
  }

  const openDetailsPanel = (e: string) => {
    setExpanded(['details'])
    setDetailsExpanded([e])
    setOrderExpanded([])
  }

  const expandPanels = () => {
    // we check if the main panels are deployed
    const mainKeys = Object.keys(panelsList);
    let allIn = true;
    for (const k of mainKeys) {
      allIn = allIn && expanded.indexOf(k) >= 0;
    }

    // if the main panels are axpanded, we expand the children
    if (allIn) {
      setDetailsExpanded(Object.keys(detailsPanelsList))
      setOrderExpanded(Object.keys(orderPanelsList))
    }
    // otherwise we expand the main panels
    else {
      setExpanded(mainKeys)
    }
  }

  const minimizePanels = () => {
    // if the main panels are axpanded, we expand the children
    if (detailsExpanded.length > 0 || orderExpanded.length > 0) {
      setDetailsExpanded([])
      setOrderExpanded([])
    }
    // otherwise we expand the main panels
    else {
      setExpanded([])
    }
  }

  // adding validation criterias
  useEffect(() => {
    inputClientDate.setCriterias({
      ...inputClientDate.criterias,
      client: {
        required: validateRequired(),
      },
    });
  }, []);

  const computeGrandPrice = () => {
    let price = 0;
    price += inputAddress.values.price;
    price += inputMenus.values.price;
    price += inputMaterials.values.price;
    price += inputDrinks.values.price;
    price += inputService.values.price;
    return price
  }

  const addCustomMenu = (menu: Optional<Data.Menu, "id"> & Models.Identifiable) => {
    // add menu to db
    const keys = update({ menus: [menu] });
    if (!keys.menus) {
      throw Error("addCustomMenu: update() failed to return id.");
    }
    const newMenu = {
      ...menu,
      id: keys.menus[0],
    }
    const newMenus = addItemToPool<Inputs.Menu & Models.Identifiable>(inputMenus.values.menus, newMenu);
    inputMenus.setValues({
      menus: newMenus,
      price: newMenus.reduce((p, v) => p + v.price, 0),
    });
  }

  const handleClientChange = (client: Data.Client | null) => {
    if (props.onClientChange) {
      props.onClientChange(client)
    }
  }

  const handleDateChange = (date: Date) => {
    if (props.onDateChange) {
      props.onDateChange(date)
    }
  }

  const transferMenu = (item: Data.Menu & Models.Quantified) => {
    if (props.onTransfer) {
      props.onTransfer('menu', [item]);
    }
  }

  const transferMaterial = (item: Data.Material & Models.Quantified) => {
    if (props.onTransfer) {
      props.onTransfer('material', [item]);
    }
  }

  const transferDrink = (item: Data.Drink & Models.Quantified) => {
    if (props.onTransfer) {
      props.onTransfer('drink', [item]);
    }
  }

  // inserting payload from transfer
  useEffect(() => {
    if (!props.transferPayload?.target) { return; }
    if (!props.transferPayload.items || props.transferPayload.items.length == 0) { return; }

    const target = props.transferPayload.target;

    if (target === "menu") {
      const items = props.transferPayload.items as (Data.Menu & Models.Quantified)[];
      let currentItems = inputMenus.values.menus;
      for (const item of items) {
        currentItems = addItemToPool(currentItems, item);
      }
      inputMenus.setValues({
        menus: currentItems,
        price: currentItems.reduce((p, v) => p + v.price * (v.quantity || 1), 0),
      });
    }

    if (target === "drink") {
      const items = props.transferPayload.items as (Data.Drink & Models.Quantified)[];
      let currentItems = inputDrinks.values.drinks;
      for (const item of items) {
        currentItems = addItemToPool(currentItems, item);
      }
      inputDrinks.setValues({
        drinks: currentItems,
        price: currentItems.reduce((p, v) => p + v.price * (v.quantity || 1), 0),
      });
    }

    if (target === "material") {
      const items = props.transferPayload.items as (Data.Material & Models.Quantified)[];
      let currentItems = inputMaterials.values.materials;
      for (const item of items) {
        currentItems = addItemToPool(currentItems, item);
      }
      inputMaterials.setValues({
        materials: currentItems,
        price: currentItems.reduce((p, v) => p + v.price * (v.quantity || 1), 0),
      });
    }

  }, [props.transferPayload])

  // link menu's materials to materials
  useEffect(() => {

    if (!isMaterialLinked) { return; }

    // check validity of menus quantities
    const valid = inputMaterials.values.materials.reduce((p, v) => isNumber(v.quantity) && p, true);
    if (!valid) { return; }

    const materials = getMaterialsOfMenus();

    let isChange = false;
    for (const material of materials) {
      const existing = inputMaterials.values.materials.find(v => v.id === material.id);

      if (!existing) {
        // material is new
        isChange = true;
        inputMaterials.values.materials.push(material);
      } else if (existing.quantity != material.quantity) {
        // material quantity has changed
        isChange = true;
        existing.quantity += material.quantity;
      }
    }

    if (!isChange) {
      return;
    }

    inputMaterials.setValues({
      materials: inputMaterials.values.materials,
      price: inputMaterials.values.materials.reduce((p, v) => p + v.price, 0),
    });
  }, [inputMenus, isMaterialLinked]);

  useEffect(() => {

    // this useEffect only handle the case: linked -> not linked
    if (isMaterialLinked) { return; }

    // check validity of menus quantities
    const valid = inputMaterials.values.materials.reduce((p, v) => isNumber(v.quantity) && p, true);
    if (!valid) { return; }

    const materials = getMaterialsOfMenus();

    const newMaterials: (Data.Material & Models.Quantified)[] = [];
    for (const existing of inputMaterials.values.materials) {
      const material = materials.find(v => v.id === existing.id);

      if (material) {
        if (existing.quantity > material.quantity) {
          existing.quantity -= material.quantity;
        } else {
          continue;
        }
      }
      newMaterials.push(existing);
    }

    inputMaterials.setValues({
      materials: newMaterials,
      price: inputMaterials.values.materials.reduce((p, v) => p + v.price, 0),
    });
  }, [isMaterialLinked]);


  const getMaterialsOfMenus = () => {
    let materials: (Data.Material & Models.Quantified)[] = [];

    for (const menu of inputMenus.values.menus) {
      for (const plat of menu.plats) {
        for (const material of plat.materials) {
          materials = addItemToPool(
            materials,
            material,
            menu.quantity * plat.quantity * material.quantity
          );
        }
      }
    }

    // take account of batch size of materials
    for (const material of materials) {
      const nBatch = Math.ceil(material.quantity / material.batch);
      material.quantity = nBatch * material.batch;
    }

    return materials;
  }

  const isDisabled = !(props.editMode || props.creationMode);

  const quickLabelChange = (label: Data.Label) => {
    saveEvent();
  }

  return (
    <>
      <Grid
        container
        direction="row"
        className={classes.actionsHeader}
      >
        <div className={classes.customActionsHeader}>
          {props.useBackIcon && (
            <Tooltip title="Cancel">
              <IconButton aria-label="cancel" onClick={() => { resetEvent() }}>
                <KeyboardBackspaceIcon />
              </IconButton>
            </Tooltip>
          )}
          {props.children}
        </div>
        <div>
          <Labels
            onChange={quickLabelChange}
            controller={inputLabels}
          />
        </div>
        <Tooltip arrow title="Compacter">
          <IconButton onClick={minimizePanels}>
            <Crop75Icon />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title="Déployer">
          <IconButton onClick={expandPanels}>
            <CropPortraitIcon />
          </IconButton>
        </Tooltip>
      </Grid>
      <Paper>
        <OverviewPanel
          primary
          highlighted={props.editMode || props.creationMode}
          name="details"
          expanded={expanded}
          onClick={setExpanded}
          panelsList={panelsList}
          noActions
        >
          <OverviewPanel
            name="client"
            expanded={detailsExpanded}
            onClick={setDetailsExpanded}
            panelsList={detailsPanelsList}
            error={inputClientDate.validations.client.error}
            icon={<PersonIcon />}
            subtitles={[{
              text: inputClientDate.values.client
            }]}
            disabled={isDisabled}
          >
            <OverviewDetailsClient
              disabled={isDisabled}
              onClientChange={handleClientChange}
              inputClientDate={inputClientDate}
            />
          </OverviewPanel>
          <OverviewPanel
            name="date"
            expanded={detailsExpanded}
            onClick={setDetailsExpanded}
            panelsList={detailsPanelsList}
            error={inputClientDate.validations.date.error}
            icon={<EventIcon />}
            subtitles={[{
              text: getTimeDateLabel('date')
            }, {
              text: getTimeDateLabel('time')
            }]}
            disabled={isDisabled}
          >
            <OverviewDetailsDate
              disabled={isDisabled}
              inputClientDate={inputClientDate}
              onDateChange={handleDateChange}
            />
          </OverviewPanel>
          <OverviewPanel
            name="type"
            expanded={detailsExpanded}
            onClick={setDetailsExpanded}
            panelsList={detailsPanelsList}
            error={inputClientDate.validations.type.error || inputClientDate.validations.people.error}
            icon={<PeopleIcon />}
            subtitles={[{
              text: inputClientDate.values.people > 0 ? `(${inputClientDate.values.people})` : ''
            }, {
              text: inputClientDate.values.type
            }]}
          >
            <OverviewDetailsOther
              disabled={isDisabled}
              inputClientDate={inputClientDate}
            />
          </OverviewPanel>
          <OverviewPanel
            name="address"
            expanded={detailsExpanded}
            onClick={setDetailsExpanded}
            panelsList={detailsPanelsList}
            icon={<LocationOnIcon />}
            error={inputAddress.validations.address.error}
            subtitle={inputAddress.values.town ? inputAddress.values.town + ` (${inputAddress.values.canton})` : ''}
            disabled={isDisabled}
            onEmpty={() => { inputAddress.reset() }}
          >
            <AddressInputs
              disabled={isDisabled}
              controller={inputAddress}
            />
          </OverviewPanel>
          <OverviewPanel
            name="specials"
            expanded={detailsExpanded}
            onClick={setDetailsExpanded}
            panelsList={detailsPanelsList}
            subtitle={truncate(inputComment.values.comment, 25)}
            icon={<ContactSupportIcon />}
            error={inputComment.validations.comment.error}
            onNext={() => { openOrderPanel('menu') }}
            disabled={isDisabled}
          >
            <OverviewDetailsSpecial
              disabled={isDisabled}
              inputComment={inputComment}
            />
          </OverviewPanel>
        </OverviewPanel>
        <OverviewPanel
          primary
          highlighted={props.editMode || props.creationMode}
          name="order"
          expanded={expanded}
          onClick={setExpanded}
          panelsList={panelsList}
          noActions
        >
          <OverviewPanel
            name="menu"
            expanded={orderExpanded}
            onClick={setOrderExpanded}
            panelsList={orderPanelsList}
            icon={<RestaurantMenuIcon />}
            subtitle={inputMenus.values.menus.length > 0 ? `(${inputMenus.values.menus.length})` : ''}
            total={inputMenus.values.price.toFixed(2)}
            onPrevious={() => { openDetailsPanel('specials') }}
            disabled={isDisabled}
            onEmpty={() => { inputMenus.reset() }}
          >
            <OverviewMenu
              addCustomMenu={addCustomMenu}
              disabled={isDisabled}
              selectLabel="Ajouter un menu..."
              controllerMenu={inputMenus}
              transferMode={props.transferMode}
              onTransfer={transferMenu}
              baseQuantity={inputClientDate.values.people}
              isMaterialLinked={[isMaterialLinked, setIsMaterialLinked]}
            />
          </OverviewPanel>
          <OverviewPanel
            name="materials"
            expanded={orderExpanded}
            onClick={setOrderExpanded}
            icon={<RestaurantIcon />}
            panelsList={orderPanelsList}
            subtitle={inputMaterials.values.materials.length > 0 ? `(${inputMaterials.values.materials.length})` : ''}
            total={inputMaterials.values.price.toFixed(2)}
            disabled={isDisabled}
            onEmpty={() => {
              inputMaterials.reset();
              setIsMaterialLinked(false);
            }}
          >
            <OverviewQuickList
              disabled={isDisabled}
              label="Matériel"
              target="materials"
              selectLabel="Ajouter du matériel..."
              controller={inputMaterials}
              transferMode={props.transferMode}
              onTransfer={transferMaterial}
              actionProps={{
                type: "switch",
                label: "Importer la vaisselle liée aux menus",
                value: isMaterialLinked
              }}
              baseQuantity={inputClientDate.values.people}
              onAction={(e) => { setIsMaterialLinked(e.target.checked) }}
            />
          </OverviewPanel>
          <OverviewPanel
            name="drinks"
            expanded={orderExpanded}
            onClick={setOrderExpanded}
            panelsList={orderPanelsList}
            icon={<EmojiFoodBeverageIcon />}
            subtitles={[{
              text: inputDrinks.values.drinks.length > 0 ? `(${inputDrinks.values.drinks.length})` : ''
            }]}
            total={inputDrinks.values.price.toFixed(2)}
            disabled={isDisabled}
            onEmpty={() => { inputDrinks.reset() }}
          >
            <OverviewQuickList
              disabled={isDisabled}
              label='Boissons'
              target="drinks"
              selectLabel="Ajouter une boisson..."
              controller={inputDrinks}
              transferMode={props.transferMode}
              onTransfer={transferDrink}
              baseQuantity={inputClientDate.values.people}
            />
          </OverviewPanel>
          <OverviewPanel
            name="services"
            expanded={orderExpanded}
            onClick={setOrderExpanded}
            panelsList={orderPanelsList}
            total={inputService.values.price.toFixed(2)}
            icon={<PanToolIcon />}
            subtitles={[{
              text: inputService.values.cooksN > 0 ? `(${inputService.values.cooksN}×${inputService.values.cooksDuration}h)` : 0
            }, {
              text: inputService.values.serversN > 0 ? `[${inputService.values.serversN}×${inputService.values.serversDuration}h]` : 0
            }]}
            disabled={isDisabled}
            onEmpty={() => { inputService.reset() }}
          >
            <BuildService
              disabled={isDisabled}
              controller={inputService}
            />
          </OverviewPanel>
        </OverviewPanel>
        <Grid className={classes.grandTotalLane}>
          <TotalLane
            value={computeGrandPrice()}
            id="grand-total"
            readOnly
            onChange={() => { }}
          />
        </Grid>

        <Grid className={classes.grandTotalLane}>
          <Labels
            addButton
            disabled={!props.editMode && !props.creationMode}
            controller={inputLabels}
          />
        </Grid>

        <Grid container className={classes.grandTotalLane} spacing={1} direction="row-reverse">
          {props.creationMode && (
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => { saveEvent() }}
              >
                Create
              </Button>
            </Grid>
          )}
          {props.editMode && event && event.id && (
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => { event ? saveEvent(event.id) : '' }}
              >
                Save
              </Button>
            </Grid>
          )}
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {

                let client = getClientByName(inputClientDate.values.client);
                if (!client) {
                  generateToast("Unkown client: generation failed.", "error");
                  return;
                }

                generatePdf(extractEventData(client));
              }}
            >
              PDF
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleBack}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              disabled={!props.editMode}
              className={classes.leftBtn}
              variant="outlined"
              onClick={() => { resetEvent(true) }}
            >
              Vider
            </Button>
          </Grid>
          {false && (
            <Grid item>
              <Button
                className={classes.leftBtn}
                variant="contained"
                color="secondary"
              >
                Delete
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </>
  )
}

export default OverviewEditor;