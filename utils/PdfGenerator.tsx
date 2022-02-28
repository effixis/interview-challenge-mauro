// pdf-lib
import {
  PDFDocument,
  StandardFonts,
  PDFFont,
  PDFImage,
  PDFPage,
  rgb,
} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit';

/** RGBA color, RGB in [0,255], A in [0,1] */
export type Color = [number, number, number, number];

type FontStyle = "normal" | "bold" | "italic" | "light"

export interface Font {
  normal: PDFFont
  bold: PDFFont
  italic: PDFFont
  light?: PDFFont
}

/** 
 * Margin of text (line/image), computed as:
 * margin (top/bottom) times the font size.  
 * Defaults to 1.
 */
export interface TextMargin {
  /** Factor of text size */
  top?: number
  /** Factor of text size */
  bottom?: number
}

export interface TextVariant {
  font: Font
  size: number
  style: FontStyle
  color?: Color
  margin?: TextMargin
}

export type TextComponent = "text" | "h1" | "h2" | "h3" | "h4" | "h5"

export interface TextComponents {
  text: TextVariant
  h1?: TextVariant
  h2?: TextVariant
  h3?: TextVariant
  h4?: TextVariant
  h5?: TextVariant
}

export interface Anchor {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface DrawTextOptions {
  /** If the text is centered */
  centered?: boolean
  /**
   * Specify where to place the text
   */
  anchor?: Anchor
  /**
   * Similar to css "float" property,
   * if true, the y cursor won't be updated
   */
  floating?: boolean
  component?: TextComponent
  variant?: TextVariant
  font?: Font
  style?: FontStyle
  size?: number
  color?: Color
  margin?: TextMargin
}

export interface DrawLineOptions {
  thickness: number
  /**
   * Similar to css "float" property,
   * if true, the y cursor won't be updated
   */
  floating?: boolean
  color?: Color
  start?: { x?: number, y?: number }
  end?: { x?: number, y?: number }
  component?: TextComponent
  margin?: TextMargin
}

export interface DrawImageOptions {
  /** If the image is centered */
  centered?: boolean
  /**
   * Similar to css "float" property,
   * if true, the y cursor won't be updated
   */
  floating?: boolean
  anchor?: Anchor
  component?: TextComponent
  margin?: TextMargin
}

interface PositionOptions {
  centered?: boolean
  anchor?: Anchor
  margin?: TextMargin
}

interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

class Document {
  private defaultFontSize: number = 10;
  private defaultFontStyle: FontStyle = "normal";
  private defaultFontColor: Color = [0, 0, 0, 1];
  private defaultMargin: Required<TextMargin> = { top: 1, bottom: 1 };
  /** default font */
  private defaultFont: Font;
  /** current page */
  private page?: PDFPage;
  /** current default text variant */
  private defaultVariant: TextVariant;
  /** current height */
  private height: number;
  /** current width */
  private width: number;
  /** current render y coordinate */
  private cursor: number;
  private components?: Required<TextComponents>;

  public pdf: PDFDocument;

  private margins: Margins = {
    top: 30,
    bottom: 20,
    right: 30,
    left: 30,
  };

  constructor() {
    console.log("constructor")
    this.width = 0;
    this.height = 0;
    this.cursor = 0;

    // created in init
    this.defaultVariant = {} as TextVariant;
    this.defaultFont = {} as Font;
    this.pdf = {} as PDFDocument;

    this.init();
  }

  private async init() {
    console.log("init")
    // create pdf object
    this.pdf = await PDFDocument.create();
    // Registering the fonts
    this.pdf.registerFontkit(fontkit);

    this.defaultFont = {
      normal: await this.pdf.embedFont(StandardFonts.TimesRoman),
      bold: await this.pdf.embedFont(StandardFonts.TimesRomanBold),
      italic: await this.pdf.embedFont(StandardFonts.TimesRomanItalic),
    };

    this.defaultVariant = {
      font: this.defaultFont,
      size: this.defaultFontSize,
      style: this.defaultFontStyle,
      color: this.defaultFontColor,
      margin: this.defaultMargin,
    };
  }

  /** @returns the available font in the order: given - default*/
  private getFont(font?: Font, style?: FontStyle) {
    font = font ?? this.defaultFont;
    style = style ?? "normal";

    if (style == "light" && !font.light) {
      return font.normal;
    } else {
      return font[style] as PDFFont;
    }
  }

  private getColor(color?: Color) {
    color = color ?? this.defaultFontColor;
    return {
      rgb: rgb(
        color[0] / 255,
        color[1] / 255,
        color[2] / 255,
      ),
      opacity: color[3],
    };
  }

  /**
   * @returns The top & bottom margin applied on the cursor
   */
  private getCursorMargin(variant?: TextVariant) {
    const top = variant?.margin?.top ?? this.defaultMargin.top;
    const bottom = variant?.margin?.bottom ?? this.defaultMargin.bottom;
    const size = variant?.size ?? this.defaultFontSize;
    return {
      top: top * size,
      bottom: bottom * size,
    }
  }

  private getComponents(): Required<TextComponents> {
    if (!this.components) {
      return {
        text: this.defaultVariant,
        h1: this.defaultVariant,
        h2: this.defaultVariant,
        h3: this.defaultVariant,
        h4: this.defaultVariant,
        h5: this.defaultVariant,
      };
    }
    return this.components;
  }

  public getHeight() {
    return this.height;
  }

  public getWidth() {
    return this.width;
  }

  public getMiddle() {
    return this.width / 2;
  }

  public getCursorPosition() {
    return this.cursor;
  }

  public setComponents(components: TextComponents) {
    components.h1 = components.h1 ?? components.text;
    components.h2 = components.h2 ?? components.h1;
    components.h3 = components.h3 ?? components.h2;
    components.h4 = components.h4 ?? components.h3;
    components.h5 = components.h5 ?? components.h4;
    this.components = components as Required<TextComponents>;
  }

  public setMargins(top: number, right: number, bottom?: number, left?: number) {
    this.margins = {
      top: top,
      right: right,
      bottom: bottom ?? top,
      left: left ?? right,
    };
  }

  public async createFont(normal: string, bold: string, italic: string, light?: string) {
    return {
      normal: await this.loadFont(normal),
      bold: await this.loadFont(bold),
      italic: await this.loadFont(italic),
      light: light ? await this.loadFont(light) : undefined,
    } as Font;
  }

  private async loadFont(path: string) {

    const bytes = await fetch(path).then((res) => res.arrayBuffer());
    return await this.pdf.embedFont(bytes);
  }

  public async createImage(path: string) {
    const bytes = await fetch(path).then(res => res.arrayBuffer());
    if (path.endsWith(".png")) {
      return await this.pdf.embedPng(bytes);
    } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
      return await this.pdf.embedJpg(bytes);
    } else {
      throw new Error("Invalid image format.");
    }
  }

  public addPage(textVariant?: TextVariant) {
    this.page = this.pdf.addPage()

    const sizes = this.page.getSize()
    this.height = sizes.height;
    this.width = sizes.width;
    this.cursor = this.height - this.margins.top;

    if (textVariant) {
      this.defaultVariant = textVariant;
    }
  }

  private getPosition(
    width: number, height: number, margin: Required<TextMargin>, options?: PositionOptions
  ) {
    let x = this.margins.left;
    if (options?.centered) {
      x = (this.width / 2) - (width / 2)
    } else if (options?.anchor?.left) {
      x = options.anchor.left;
    } else if (options?.anchor?.right) {
      x = options.anchor.right - width;
    }

    let y: number;
    if (options?.anchor?.top) {
      y = options.anchor.top - height;
    } else if (options?.anchor?.bottom) {
      y = options.anchor.bottom;
    } else {
      y = this.cursor - margin.top;
    }
    return { x, y };
  }

  public drawText(text: string, options?: DrawTextOptions) {

    if (!this.page) {
      throw new Error("A page should be created before adding text.");
    }

    //////
    // define text specifications
    let variant = { ...this.getComponents().text };
    if (options) {
      if (options.component) {
        variant = { ...this.getComponents()[options.component] };
      }
      if (options.variant) {
        variant = { ...options.variant };
      }
      variant.font = options.font ?? variant.font;
      variant.style = options.style ?? variant.style;
      variant.size = options.size ?? variant.size;
      variant.color = options.color ?? variant.color;
      variant.margin = options.margin ?? variant.margin;
    }

    const { rgb, opacity } = this.getColor(variant.color);
    const pdfFont = this.getFont(variant.font, variant.style);
    const textWidth = pdfFont.widthOfTextAtSize(text, variant.size);
    const textHeight = pdfFont.heightAtSize(variant.size);

    // text position
    const margin = this.getCursorMargin(variant);
    const { x, y } = this.getPosition(textWidth, textHeight, margin, options);

    // update bottom cursor
    if (!options?.anchor?.top && !options?.anchor?.bottom && !options?.floating) {
      this.cursor = y - margin.bottom;
    }

    // draw text on page
    this.page.drawText(text, {
      x: x,
      y: y,
      size: variant.size,
      font: pdfFont,
      color: rgb,
      opacity: opacity,
    });
  }

  public drawLine(options: DrawLineOptions) {

    if (!this.page) {
      throw new Error("A page should be created before adding text.");
    }

    // define line specifications
    const { rgb, opacity } = this.getColor(options.color);
    let x0 = options.start?.x ?? this.margins.left;
    let x1 = options.end?.x ?? this.width - this.margins.right;
    let y0 = options.start?.y ?? this.cursor;
    let y1 = options.end?.y ?? this.cursor;

    if (options.component) {
      const variant = { ...this.getComponents()[options.component] };
      variant.margin = options.margin ?? variant.margin;
      const margin = this.getCursorMargin(variant);
      y0 -= margin.top;
      y1 -= margin.top;

      if (!options?.floating) {
        // update cursor -> top & bottom
        this.cursor -= options.thickness + margin.top + margin.bottom;
      }
    }

    this.page.drawLine({
      start: { x: x0, y: y0 },
      end: { x: x1, y: y1 },
      thickness: options.thickness,
      color: rgb,
      opacity: opacity,
    });
  }

  public drawImage(image: PDFImage, options?: DrawImageOptions) {

    if (!this.page) {
      throw new Error("A page should be created before adding text.");
    }

    let margin: Required<TextMargin> = { top: 0, bottom: 0 };

    if (options?.component) {
      const variant = { ...this.getComponents()[options.component] };
      variant.margin = options.margin ?? variant.margin;
      margin = this.getCursorMargin(variant);
    }

    // text position
    const { x, y } = this.getPosition(
      image.width,
      image.height,
      margin,
      options
    );

    // update cursor
    if (!options?.anchor?.top && !options?.anchor?.bottom && !options?.floating) {
      this.cursor = y - margin.bottom;
    }

    this.page.drawImage(image, {
      x: x,
      y: y
    });
  }

  /**
   * Save / download the PDF on the client browser
   */
  public async save() {
    const bytes = await this.pdf.save()
    require("downloadjs")(bytes, "proposition.pdf", "application/pdf");
  }

}

export default Document;