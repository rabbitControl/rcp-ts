
import {GroupParameter} from './GroupParameter';
import KaitaiStream from '../KaitaiStream';
import {TypeDefinition} from '../typedefinition/TypeDefinition';
import Writeable from '../Writeable';
import { writeTinyString, writeShortString, pushIn32ToArrayBe, pushIn16ToArrayBe } from '../Utils';
import RcpTypes, { TinyString, ShortString, Userdata } from '../RcpTypes';
import ParameterManager from '../ParameterManager';
import { Widget } from '../widget/Widget';
import { ChangedListener } from '../ChangeListener';
import { parseWidget } from '../RCPWidgetParser';



export abstract class Parameter implements Writeable {

  static readonly LANGUAGE_ANY = "any";
  static readonly allOptions: Map<number, boolean> = new Map().
                    set(RcpTypes.ParameterOptions.VALUE, true).
                    set(RcpTypes.ParameterOptions.LABEL, true).
                    set(RcpTypes.ParameterOptions.DESCRIPTION, true).
                    set(RcpTypes.ParameterOptions.TAGS, true).
                    set(RcpTypes.ParameterOptions.ORDER, true).
                    set(RcpTypes.ParameterOptions.PARENTID, true).
                    set(RcpTypes.ParameterOptions.WIDGET, true).
                    set(RcpTypes.ParameterOptions.USERDATA, true).
                    set(RcpTypes.ParameterOptions.USERID, true).
                    set(RcpTypes.ParameterOptions.READONLY, true);

  readonly id: number;
  readonly typeDefinition: TypeDefinition;

  // optionals
  private _label?: string;
  private languageLabels: Map<string, string> = new Map();

  private _description?: string;
  private languageDescriptions: Map<string, string> = new Map();

  private _tags?: string;
  private _order?: number;
  private _parent?: GroupParameter;
  private _widget?: Widget;
  private _userdata?: any;
  private _userid?: string;
  private _readonly?: boolean;

  // other fields
  manager?: ParameterManager;
  changed: Map<number, boolean> = new Map();

  private changedListeners: ChangedListener[] = [];  

  constructor(id: number, typeDefinition: TypeDefinition) {
    this.id = id;
    this.typeDefinition = typeDefinition;
  }

  isValid(): boolean {
    return this.typeDefinition.datatype != 0;
  }

  //------------------------------------
  // change listener
  addChangeListener(listener: ChangedListener) {
    if (this.changedListeners.indexOf(listener) >= 0) {
      return;
    }

    this.changedListeners.push(listener);
  }

  removeChangedListener(listener: ChangedListener) {

    const idx = this.changedListeners.indexOf(listener);
    if (idx < 0) {
      return;
    }

    this.changedListeners.splice(idx, 1);
  }

  //------------------------------------
  // update
  update(parameter: Parameter) {

    // check
    if (this.id !== parameter.id) {
      return;
    }

    let changed = false;

    if (parameter._label) {
      this._label = parameter._label;
      changed = true;
    }

    if (parameter.languageLabels.size > 0) {
      
      this.languageLabels.clear();

      parameter.languageLabels.forEach( (v, k) => {
        this.languageLabels.set(k, v);
      });

      changed = true;
    }

    if (parameter._description) {
      this._description = parameter._description;
      changed = true;
    }

    if (parameter.languageDescriptions.size > 0) {
      
      this.languageDescriptions.clear();

      parameter.languageDescriptions.forEach( (v, k) => {
        this.languageDescriptions.set(k, v);
      });

      changed = true;
    }

    if (parameter._tags) {
      this._tags = parameter._tags;
      changed = true;
    }

    if (parameter._order != undefined) {
      this._order = parameter._order;
      changed = true;
    }

    // todo
    if (parameter._parent) {
      // this._description = parameter._description
      changed = true;
    }

    if (parameter._widget) {
      this._widget = parameter._widget;
      changed = true;
    }

    if (parameter._userdata) {
      this._userdata = parameter._userdata;
      changed = true;
    }

    if (parameter._userid) {
      this._userid = parameter._userid;
      changed = true;
    }  

    // if something was changed, call listeners
    if (changed) {
      this.changedListeners.forEach( (listener) => {
        listener(this);
      });
    }
  }

  //------------------------------------
  // 
  writeLabel(output: number[]) {

    // concat label and all language-labels
    if (this._label) {
        output.push("any".charCodeAt(0));
        output.push("any".charCodeAt(1));
        output.push("any".charCodeAt(2));
        writeTinyString(this._label, output);
    }
    if (this.languageLabels.size > 0) {

      this.languageLabels.forEach((value, code) => {
        if (code.length < 3) {
          return;
        }
      
        output.push(code.charCodeAt(0));
        output.push(code.charCodeAt(1));
        output.push(code.charCodeAt(2));
        writeTinyString(value, output);
      });
    }

    output.push(RcpTypes.TERMINATOR);
  }

  writeDescription(output: number[]) {

    // concat label and all language-labels
    if (this._description) {
        output.push("any".charCodeAt(0));
        output.push("any".charCodeAt(1));
        output.push("any".charCodeAt(2));
        writeShortString(this._description, output);
    }
    if (this.languageDescriptions.size > 0) {

      this.languageDescriptions.forEach((value, code) => {
        if (code.length < 3) {
          return;
        }
      
        output.push(code.charCodeAt(0));
        output.push(code.charCodeAt(1));
        output.push(code.charCodeAt(2));
        writeShortString(value, output);
      });
    }

    output.push(RcpTypes.TERMINATOR);
  }

  write(output: Array<number>, all: boolean): void {

    let ch = this.changed;
    if (all) {
      ch = Parameter.allOptions;
    }

    ch.forEach((value, key) => {

      switch (key) {
        case RcpTypes.ParameterOptions.VALUE:
          // handled in ValueParameter
          break;

        case RcpTypes.ParameterOptions.LABEL: {

          output.push(RcpTypes.ParameterOptions.LABEL);
          if (this._label || this.languageLabels.size > 0) {
            this.writeLabel(output);
          } else {
            // label was erased
            output.push(RcpTypes.TERMINATOR);
          }
          break;
        }

        case RcpTypes.ParameterOptions.DESCRIPTION: {

          output.push(RcpTypes.ParameterOptions.DESCRIPTION);
          if (this._description || this.languageDescriptions.size > 0) {
            this.writeDescription(output)            
          } else {
            // description was erased
            output.push(RcpTypes.TERMINATOR);
          }
          break;
        }

        case RcpTypes.ParameterOptions.TAGS: {
          output.push(RcpTypes.ParameterOptions.TAGS);
          if (this._tags) {
            writeTinyString(this._tags, output);
          } else {
            writeTinyString("", output);
          }
          break;
        }

        case RcpTypes.ParameterOptions.ORDER: {
          output.push(RcpTypes.ParameterOptions.ORDER);
          if (this._order != undefined) {
            pushIn32ToArrayBe(this._order, output);
          } else {
            pushIn32ToArrayBe(0, output);
          }
          break;
        }

        case RcpTypes.ParameterOptions.PARENTID: {
          output.push(RcpTypes.ParameterOptions.PARENTID);
          if (this._parent) {
            pushIn16ToArrayBe(this._parent.id, output);
          } else {
            pushIn16ToArrayBe(0, output);
          }
          break;
        }

        case RcpTypes.ParameterOptions.WIDGET: {
          output.push(RcpTypes.ParameterOptions.WIDGET);
          if (this._widget) {
            this._widget.write(output, all);
          } else {
            output.push(RcpTypes.TERMINATOR);
          }
          break;
        }

        case RcpTypes.ParameterOptions.READONLY: {
          output.push(RcpTypes.ParameterOptions.READONLY);
          if (this._readonly) {
            output.push(this._readonly ? 1 : 0);
          } else {
            output.push(0);
          }
          break;
        }

        case RcpTypes.ParameterOptions.USERDATA: {
          //output.push(RcpTypes.ParameterOptions.USERDATA);
          if (this._userdata != undefined) {
            // TODO
          } else {

          }
          break;
        }

        case RcpTypes.ParameterOptions.USERID: {
          output.push(RcpTypes.ParameterOptions.USERID);
          if (this._userid) {
            writeTinyString(this._userid, output);
          } else {
            writeTinyString("", output);
          }
          break;
        }
      }
    });

    if (!all) {
      this.changed.clear();
    }
  }

  handleOption(optionId: number, io: KaitaiStream): boolean {
    return false;
  }

  parseOptions(io: KaitaiStream) {

    // first parse type options
    this.typeDefinition.parseOptions(io);

    while (true) {
      // read option
      const optionId = io.readU1();

      if (optionId == RcpTypes.TERMINATOR) {
        break;
      }

      switch (optionId) {
        case RcpTypes.ParameterOptions.LABEL: {

            let current = io.pos;
            let ppeekk  = io.readS1();
  
            while (ppeekk != 0) {
  
                // rewind one
                io.seek(current);
  
                const lang_code = KaitaiStream.bytesToStr(io.readBytes(3), "utf-8");
                const label     = new TinyString(io).data;
  
                if (label) {
                  if (lang_code === "any") {
                      // console.log("any language label: " + label);
                      this._label = label;
                  }
                  else {
                      console.log("setting language label " +
                                        lang_code +
                                        " : " +
                                        label);
                      this.languageLabels.set(lang_code, label);
                  }
                }
  
                current = io.pos;
                ppeekk = io.readS1();
            }
            break;
          }

        case RcpTypes.ParameterOptions.DESCRIPTION: {

          let current = io.pos;
          let ppeekk  = io.readS1();
  
          while (ppeekk != 0) {
  
              // rewind one
              io.seek(current);
  
              const lang_code = KaitaiStream.bytesToStr(io.readBytes(3), "utf-8");
              const description = new ShortString(io).data;
  
              if (description) {
                if (lang_code === "any") {
                    // console.log("any language description: " + description);
                    this._description = description;
                }
                else {
                    console.log("setting language label " +
                                      lang_code +
                                      " : " +
                                      description);
                    this.languageDescriptions.set(lang_code, description);
                }
              }
  
              current = io.pos;
              ppeekk = io.readS1();
          }
          break;
        }


        case RcpTypes.ParameterOptions.TAGS:
          this._tags = new TinyString(io).data;
          break;

        case RcpTypes.ParameterOptions.ORDER:
          this._order = io.readS4be();
          break;

        case RcpTypes.ParameterOptions.PARENTID:
          const parentid = io.readS2be();

          if (parentid != 0 && this.manager) {
            this._parent = this.manager.getParameter(parentid) as GroupParameter;

            if (this._parent) {
              this._parent.addChild(this);
            } else {
              console.log("no PARENT??");
            }            
          }
          break;

        case RcpTypes.ParameterOptions.WIDGET: {
          this._widget = parseWidget(io, this);
        }
          break;

        case RcpTypes.ParameterOptions.READONLY:
          this._readonly = io.readS1() > 0;
          break;

        case RcpTypes.ParameterOptions.USERDATA:
          this._userdata = new Userdata(io).data;
          break;

        case RcpTypes.ParameterOptions.USERID:
          this._userid = new TinyString(io).data;
          break;

        case RcpTypes.ParameterOptions.VALUE:        
        default:
          if (!this.handleOption(optionId, io)) {
            throw new Error("parameter option not handled: " + optionId);
          }
          break;
      }
    }
  }

  setDirty() {
    if (this.manager) {
      this.manager.setParameterDirty(this);
    }
  }

  // setter / getter

  //--------------------------------
  // label
  set label(label: string | undefined) {
    if (this._label === label) {
      return;
    }

    this._label = label;
    this.changed.set(RcpTypes.ParameterOptions.LABEL, true);
    this.setDirty();
  }

  get label(): string | undefined {
    return this._label;
  }

  getLabelLanguages(): IterableIterator<string> {
    return this.languageLabels.keys();
  }

  getLanguageLabel(code: string): string | undefined {
    return this.languageLabels.get(code);
  }

  clearLanguageLabels() {
    this.languageLabels.clear();
    this.changed.set(RcpTypes.ParameterOptions.LABEL, true);
    this.setDirty();
  }

  setLanguageLabel(code: string, label: string) {
    this.languageLabels.set(code, label);
    this.changed.set(RcpTypes.ParameterOptions.LABEL, true);
    this.setDirty();
  }

  removeLanguageLabel(code: string) {
    this.languageLabels.delete(code);
    this.changed.set(RcpTypes.ParameterOptions.LABEL, true);
    this.setDirty();
  }

  //--------------------------------
  // description
  set description(description: string | undefined) {
    if (this._description === description) {
      return;
    }

    this._description = description;
    this.changed.set(RcpTypes.ParameterOptions.DESCRIPTION, true);
    this.setDirty();
  }

  get description(): string | undefined {
    return this._description;
  }

  getDescriptionLanguages(): IterableIterator<string> {
    return this.languageDescriptions.keys();
  }

  getLanguageDescription(code: string): string | undefined {
    return this.languageDescriptions.get(code);
  }

  clearLanguageDescriptions() {
    this.languageDescriptions.clear();
    this.changed.set(RcpTypes.ParameterOptions.DESCRIPTION, true);
    this.setDirty();
  }

  setLanguageDescription(code: string, description: string) {
    this.languageDescriptions.set(code, description);
    this.changed.set(RcpTypes.ParameterOptions.DESCRIPTION, true);
    this.setDirty();
  }

  removeLanguageDescription(code: string) {
    this.languageDescriptions.delete(code);
    this.changed.set(RcpTypes.ParameterOptions.DESCRIPTION, true);
    this.setDirty();
  }

  //--------------------------------
  // tags
  set tags(tags: string | undefined) {
    if (this._tags === tags) {
      return;
    }

    this._tags = tags;
    this.changed.set(RcpTypes.ParameterOptions.TAGS, true);
    this.setDirty();
  }

  get tags(): string | undefined {
    return this._tags;
  }

  //--------------------------------
  // order
  set order(order: number | undefined) {
    if (this._order === order) {
      return;
    }

    this._order = order;
    this.changed.set(RcpTypes.ParameterOptions.ORDER, true);
    this.setDirty();
  }

  get order(): number | undefined {
    return this._order;
  }

  //--------------------------------
  // parent
  set parent(parent: GroupParameter | undefined) {
    if (this._parent != undefined && parent != undefined && this._parent.id === parent.id) {
      return;
    }

    this.parent = parent;
    this.changed.set(RcpTypes.ParameterOptions.PARENTID, true);
    this.setDirty();
  }

  get parent(): GroupParameter | undefined {
    return this._parent;
  }

  //--------------------------------
  // widget
  set widget(widget: Widget | undefined) {
    this._widget = widget;

    if (this._widget) {
      this._widget.parameter = this
    }

    this.changed.set(RcpTypes.ParameterOptions.WIDGET, true);
    this.setDirty();
  }

  get widget(): Widget | undefined{
    return this._widget
  }

  //--------------------------------
  // userdata
  set userdata(userdata: any) {
    if (this._userdata === userdata) {
      return;
    }

    this._userdata = userdata;
    this.changed.set(RcpTypes.ParameterOptions.USERDATA, true);
    this.setDirty();
  }

  get userdata(): any {
    return this._userdata;
  }

  //--------------------------------
  // description
  set userid(userid: string | undefined) {
    if (this._userid === userid) {
      return;
    }

    this._userid = userid;
    this.changed.set(RcpTypes.ParameterOptions.USERID, true);
    this.setDirty();
  }

  get userid(): string | undefined{
    return this._userid;
  }

  //--------------------------------
  // readonly
  set readonly(value: boolean | undefined) {
    if (this._readonly === value) {
      return;
    }

    this._readonly = value;
    this.changed.set(RcpTypes.ParameterOptions.READONLY, true);
    this.setDirty();
  }

  get readonly(): boolean | undefined{
    return this._readonly;
  }

}