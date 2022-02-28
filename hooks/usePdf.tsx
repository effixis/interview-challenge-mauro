// pdf-lib
import {
  PDFImage,
} from 'pdf-lib'

// utils
import { Data } from '../utils/types';

// hooks
import { useData } from './useData';
import Document, { Color, DrawTextOptions, TextComponents } from '../utils/PdfGenerator';

class DefaultPDF extends Document {
  public readonly COLOR1: Color = [195, 163, 114, 1];
  public readonly COLOR2: Color = [151, 71, 6, 1];
  public readonly COLOR3: Color = [206, 153, 0, 1];
  public readonly MARGIN = 30;
  public readonly LARGE_MARGIN = 80;
  public readonly SEP = 5;
  private logo: PDFImage;

  constructor() {
    super();

    // created in initiate
    this.logo = {} as PDFImage;
  }

  private async initiate() {

    // load fonts
    const font = await this.createFont(
      '/assets/fonts/Candara.ttf',
      '/assets/fonts/Candarab.ttf',
      '/assets/fonts/Candarai.ttf',
      '/assets/fonts/Candaral.ttf',
    );

    // load logo
    this.logo = await this.createImage('/assets/img/mauro_logo_small.png');

    const comps: TextComponents = {
      text: {
        font: font,
        size: 10,
        style: "normal",
      },
      h1: {
        font: font,
        size: 14,
        style: "normal",
        color: this.COLOR3,
      },
      h2: {
        font: font,
        size: 14,
        style: "normal",
      },
      h3: {
        font: font,
        size: 12,
        style: "bold",
      },
      h4: {
        font: font,
        size: 11,
        style: "bold",
      },
    };
    this.setComponents(comps);
    this.setMargins(200, this.MARGIN);
  }

  public static async create() {
    const doc = new DefaultPDF();
    await doc.initiate();
    return doc;
  }

  private buildHeader() {
    this.drawText("MAURO TRAITEUR", {
      color: this.COLOR1,
      anchor: {
        right: this.getMiddle() - this.SEP / 2,
        bottom: this.getHeight() - 50,
      },

    });
    this.drawText("GASTRONOMIE ITALIENNE", {
      style: "light",
      color: this.COLOR1,
      anchor: {
        left: this.getMiddle() + this.SEP / 2,
        bottom: this.getHeight() - 50,
      },
    });

    this.drawImage(this.logo, {
      centered: true,
      anchor: {
        top: this.getHeight() - 60
      }
    });
  }

  private buildFooter() {
    this.drawText(
      "www.maurotraiteur.com • contact@maurotraiteur.com • 021 903 37 41",
      {
        centered: true,
        size: 8,
        style: "light",
        anchor: {
          bottom: 20,
        }
      });
  }

  public addPage() {
    super.addPage();
    this.buildHeader();
    this.buildFooter();
  }

  public addKeyValue(key: string, value: string) {
    this.drawText(key, {
      floating: true,
      anchor: {
        right: this.getMiddle() - this.SEP,
      },
    });
    this.drawText(value, {
      style: "bold",
      anchor: {
        left: this.getMiddle() + this.SEP,
      },
    });
  }

  private addDevis = (
    title: string, total?: number, quantity?: number,
    price?: number, subtitle?: string, strong?: boolean
  ) => {

    const root: DrawTextOptions = {
      floating: true,
      margin: {
        top: strong ? 2.5 : 0.5,
      },
    };

    this.drawText(
      title,
      {
        ...root,
        anchor: {
          left: this.LARGE_MARGIN
        },
      });

    if (total) {
      this.drawText(
        total.toFixed(2),
        {
          ...root,
          style: strong ? "bold" : "normal",
          anchor: {
            right: this.getWidth() - this.LARGE_MARGIN,
          },
        });
    }

    if (price) {
      this.drawText(
        price.toFixed(2),
        {
          ...root,
          style: strong ? "bold" : "normal",
          anchor: {
            right: this.getWidth() - 100 - this.LARGE_MARGIN,
          },
        });
    }

    if (quantity) {
      this.drawText(
        quantity.toString(),
        {
          ...root,
          anchor: {
            right: this.LARGE_MARGIN - this.SEP,
          },
        });
    }

    // go to next line
    this.drawText("", {
      ...root,
      floating: false,
    });

    if (subtitle) {
      this.drawText(
        subtitle,
        {
          style: "italic",
          margin: {
            top: 0.3,
            bottom: 1.3,
          },
          anchor: {
            left: this.LARGE_MARGIN
          },
        });
    }
  }

  public addDevisCategory(
    title: string, total?: number, quantity?: number, price?: number, subtitle?: string
  ) {
    this.addDevis(title, total, quantity, price, subtitle, true);
  }

  public addDevisItem(
    title: string, total?: number, quantity?: number, price?: number, subtitle?: string
  ) {
    this.addDevis(title, total, quantity, price, subtitle, false);
  }

  public addDevisTotal(total: number) {

    this.drawLine({
      thickness: 2,
      component: "text",
      margin: {
        top: 2,
        bottom: 0.3,
      },
      color: this.COLOR2,
    });

    this.drawText("Total", {
      floating: true,
      style: "bold",
      anchor: {
        left: this.LARGE_MARGIN,
      },
    });

    this.drawText(
      `CHF ${total.toFixed(2)}`,
      {
        style: "bold",
        anchor: {
          right: this.getWidth() - this.LARGE_MARGIN,
        },
      });
  }

  public addUnderlinedTitle(title: string) {
    this.drawText(title, {
      centered: true,
      component: "h2",
      margin: {
        top: 0,
        bottom: 0.5
      }
    });

    this.drawLine({
      thickness: 2,
      color: this.COLOR2,
      component: "h2",
      margin: {
        top: 0,
        bottom: 1,
      }
    });
  }

  public addTitle(title: string) {
    this.drawText(title, {
      centered: true,
      component: "h1",
    });
  }

  public addSubTitle(title: string) {
    this.drawText(title, {
      component: "h3",
      centered: true,
    });
  }

  public addMenuTitle(title: string) {
    this.drawText(title, {
      component: "h4",
      centered: true,
    });
  }

  public addLine = (text: string, margin?: number, marginBottom?: number) => {
    this.drawText(text, {
      centered: true,
      margin: {
        top: margin ?? 1,
        bottom: marginBottom ?? margin ?? 1,
      },
    });
  }

  public addSignature = () => {
    this.drawText(
      "Signature: ________________________",
      {
        floating: true,
        style: "bold",
        anchor: {
          right: this.getWidth() - this.LARGE_MARGIN,
        },
      });
  }
}

function usePdf() {

  const { data } = useData();

  const generatePdf = async (event: Omit<Data.Event, "id">) => {

    const doc = await DefaultPDF.create();
    console.dir(doc)
    const date = new Date(event.date);

    doc.addPage();

    doc.addUnderlinedTitle("Offre pour votre évènement");
    doc.addTitle("INFORMATIONS");

    doc.addKeyValue("Qui :", event.client.name);
    doc.addKeyValue("Où :", event.address.address);
    doc.addKeyValue("", event.address.postcode + " " + event.address.town);
    doc.addKeyValue(
      "Quand :",
      date.toLocaleString(
        "ch-CH",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      )
    );
    doc.addKeyValue("Nombre d'invités :", event.people.toString());
    doc.addKeyValue(
      "Durée/heure de livraison :",
      date.toLocaleTimeString("ch-CH", {
        hour: '2-digit',
        minute: '2-digit'
      }).replace(":", "h")
    );

    doc.addPage();
    doc.addTitle("PROPOSITION");
    doc.addSubTitle("Menus");

    for (const menu of event.menus) {

      // check end page
      if (doc.getCursorPosition() < menu.plats.length * doc.MARGIN + doc.MARGIN) {
        doc.addPage();
      }

      doc.addMenuTitle(menu.name.replace("_NO_NAME_", "Plats hors menu"));

      // group of dishes, to render after sorting
      const groups = [];
      // list used for sorting
      let dishes = menu.plats;

      // sorting of dishes
      for (const category of data.config.categoriesSorted) {
        // get all dish of category
        const currentDishes = dishes.filter(m => m.category === category);
        // update sorted list
        dishes = dishes.filter(m => m.category !== category);

        if (currentDishes.length != 0) {
          groups.push(currentDishes);
        }
      }
      // add uncategorized dishes
      if (dishes.length != 0) {
        groups.push(dishes);
      }

      // render sorted groups
      for (let i = 0; i < groups.length; i++) {

        for (const dish of groups[i]) {
          let quantity = dish.quantity > 1 ? `(x${dish.quantity}) ` : "";
          doc.addLine(quantity + dish.name);
        }
        if (i !== groups.length - 1) {
          doc.addLine("***", 0.5, 0.3);
        }
      }
      doc.addLine("");
    }

    doc.addPage();
    doc.addTitle("DEVIS GLOBAL ESTIMATIF");

    // check end page
    if (doc.getCursorPosition() < event.menus.length * 2 * doc.SEP + 1.5 * doc.LARGE_MARGIN) {
      doc.addPage();
    }

    doc.addDevisCategory("MENU", event.price.menus);

    for (const menu of event.menus) {
      doc.addDevisItem(
        menu.name.replace("_NO_NAME_", "Plats hors menu"),
        (menu.price * menu.quantity),
        menu.quantity,
        menu.price,
      );
    }

    if (event.materials.length > 0) {

      // check end page
      if (doc.getCursorPosition() < event.materials.length * 2 * doc.SEP + 1.5 * doc.LARGE_MARGIN) {
        doc.addPage();
      }

      doc.addDevisCategory("LOCATION VAISSELLE/MATERIEL", event.price.material);

      for (const material of event.materials) {
        doc.addDevisItem(
          material.name,
          (material.price * material.quantity),
          material.quantity,
          material.price,
        );
      }
    }

    const priceMinerals = event.drinks.reduce(
      (p, v) => p + (v.category == "minérale" ? v.price * v.quantity : 0),
      0
    );

    if (priceMinerals > 0) {
      // check end page
      if (doc.getCursorPosition() < doc.LARGE_MARGIN) {
        doc.addPage();
      }
      doc.addDevisCategory("MINERALES", priceMinerals, undefined, undefined, "Inclus location de machine, vaisselle jetable et consommables")
    }

    const alcools = event.drinks.filter(drink => drink.category == "alcool");
    const priceAlcools = alcools.reduce((p, v) => p + v.price * v.quantity, 0);

    if (priceAlcools > 0) {
      // check end page
      if (doc.getCursorPosition() < alcools.length * 2 * doc.SEP + 1.5 * doc.LARGE_MARGIN) {
        doc.addPage();
      }

      doc.addDevisCategory("ALCOOLS", priceAlcools);
      for (const alcool of alcools) {
        doc.addDevisItem(
          alcool.name,
          alcool.price * alcool.quantity,
          alcool.quantity,
          alcool.price,
        );
      }
    }

    if (event.price.transport > 0) {
      // check end page
      if (doc.getCursorPosition() < 4 * doc.SEP + 1.5 * doc.LARGE_MARGIN) {
        doc.addPage();
      }

      doc.addDevisCategory("LIVRAISON", event.price.transport);
      if (event.delivery) {
        const factor = event.returnDelivery ? 2 : 1;
        doc.addDevisItem("Livraison aller", event.price.transport / factor);
      }
      if (event.returnDelivery) {
        const factor = event.returnDelivery ? 2 : 1;
        doc.addDevisItem("Livraison retour", event.price.transport / factor);
      }
    }

    if (event.price.service > 0) {
      // check end page
      if (doc.getCursorPosition() < 4 * doc.SEP + 1.5 * doc.LARGE_MARGIN) {
        doc.addPage();
      }

      doc.addDevisCategory("SERVICE", event.price.service);
      if (event.service.cooksN > 0) {
        doc.addDevisItem(
          `Cuisiniers (${event.service.cooksDuration}h)`,
          event.service.cooksN * event.service.cooksDuration * data.config.wagesCook,
          event.service.cooksN,
          data.config.wagesCook,
        );
      }
      if (event.service.serversN > 0) {
        doc.addDevisItem(
          `Serveurs (${event.service.serversDuration}h)`,
          event.service.serversN * event.service.serversDuration * data.config.wagesServer,
          event.service.serversN,
          data.config.wagesServer,
        );
      }
    }

    doc.addDevisTotal(Object.values(event.price).reduce((p, v) => p + v));

    doc.addPage();

    doc.addLine("Les boissons sont facturées selon la consommation.");
    if (event.price.service > 0) {
      doc.addLine("Seules les heures effectives de chaque serveur seront dans la facture finale (minimum 3 heures)");
    }
    doc.addLine("");
    doc.addLine("Le nombre d'invités est à confirmer au plus tard 5 jours avant la date de l'événement par e-mail.");
    doc.addLine("", 2);
    doc.addLine("Dans ce devis global ne sont par prévus les frais suivants:");
    doc.addLine("");
    if (priceMinerals == 0) {
      doc.addLine("- Boissons (minérales)");
    }
    doc.addLine("- Infrastructure de la salle (tables, chaises, nappage et serviettes)");
    doc.addLine("- Décoration");
    doc.addLine("", 2);
    doc.addSignature();

    await doc.save();
  }

  return {
    generatePdf,
  };

}

export default usePdf;