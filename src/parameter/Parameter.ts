
import KaitaiStream from '../KaitaiStream';
import { GroupParameter } from './GroupParameter';
import { TypeDefinition } from '../typedefinition/TypeDefinition';
import { Writeable } from '../Writeable';
import { RcpInt } from '../RcpInt';
import { RcpTypes } from '../RcpTypes';
import { ParameterManager } from '../ParameterManager';
import { ChangedListener } from '../ChangeListener';
import { RcpString } from '../RcpString';
import { UserData } from '../Userdata';
import { Widget } from '../widget/Widget';


export abstract class Parameter implements Writeable {

  static readonly LANGUAGE_ANY = "any";
  static readonly allOptions: Set<number> = new Set<number>().
                    add(RcpTypes.ParameterOptions.VALUE).
                    add(RcpTypes.ParameterOptions.LABEL).
                    add(RcpTypes.ParameterOptions.DESCRIPTION).
                    add(RcpTypes.ParameterOptions.TAGS).
                    add(RcpTypes.ParameterOptions.ORDER).
                    add(RcpTypes.ParameterOptions.PARENTID).
                    // add(RcpTypes.ParameterOptions.WIDGET).
                    add(RcpTypes.ParameterOptions.USERDATA).
                    add(RcpTypes.ParameterOptions.USERID).
                    add(RcpTypes.ParameterOptions.READONLY).
                    add(RcpTypes.ParameterOptions.ENABLED);

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
  private _userdata?: UserData;
  private _userid?: string;
  private _readonly?: boolean;
  private _enabled?: boolean;

  // other fields
  private manager?: ParameterManager;
  protected changed: Set<number> = new Set();

  private changedListeners: ChangedListener[] = [];  

  constructor(id: number, typeDefinition: TypeDefinition)
  {
    this.id = id;
    this.typeDefinition = typeDefinition;
  }

  clearChanged() {
    this.changed.clear();
  }

  parentChanged() : boolean {
    return this.changed.has(RcpTypes.ParameterOptions.PARENTID);
  }

  dispose() {
    this.removeFromParent();
    this.manager = undefined;
    this.changed.clear();    
    this.clearLanguageLabels();
    this.clearLanguageDescriptions();

    this.changedListeners = [];
  }

  setManager(manager?: ParameterManager) {
    this.manager = manager;
  }

  isValid(): boolean {
    return this.typeDefinition.datatype != 0;
  }

  onlyValueChanged() : boolean {
    return this.changed.size === 1 && 
      this.changed.has(RcpTypes.ParameterOptions.VALUE) &&
      !this.typeDefinition.didChange();
  }

  changedCount(): number {
    return this.changed.size;
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

    // update typedefinition
    let changed = this.typeDefinition.update(parameter.typeDefinition);

    if (parameter._label !== undefined) {
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

    if (parameter._description !== undefined) {
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

    if (parameter._tags !== undefined) {
      this._tags = parameter._tags;
      changed = true;
    }

    if (parameter._order !== undefined) {
      this._order = parameter._order;
      changed = true;
    }

    //--------------
    // update parent
    if (parameter._parent !== undefined)
    {
      this.parent = parameter._parent;
      changed = true;
    }

    // widget
    if (parameter._widget !== undefined) {
      this._widget = parameter._widget;
      changed = true;
    }

    // userdata
    if (parameter._userdata !== undefined) {
      this._userdata = parameter._userdata;
      changed = true;
    }

    // userid
    if (parameter._userid !== undefined) {
      this._userid = parameter._userid;
      changed = true;
    }  

    // readonly
    if (parameter._readonly !== undefined) {
      this._readonly = parameter._readonly;
      changed = true;
    }

    // enabled
    if (parameter._enabled !== undefined
      && this._enabled !== parameter._enabled)
    {
      this._enabled = parameter._enabled;
      changed = true;
    }

    // if something was changed, call listeners
    if (changed) 
    {
      this.changedListeners.forEach( (listener) => 
      {
        listener(this);
      });
    }
  }

  removeFromParent()
  {
    if (this._parent !== undefined) 
    {
      this._parent.removeChild(this);
      this._parent = undefined;
    }
  }

  //------------------------------------
  //
  writeValueUpdate(output: Array<number>)
  {
    // write id
    new RcpInt(this.id).write(output);

    // typedefinition
    output.push(this.typeDefinition.datatype);

    // write mandatory
    this.typeDefinition.writeMandatory(output);
}

  //------------------------------------
  // 
  writeLabel(output: number[]) {

    // concat label and all language-labels
    if (this._label) {
        output.push("any".charCodeAt(0));
        output.push("any".charCodeAt(1));
        output.push("any".charCodeAt(2));
        new RcpString(this._label).write(output);
    }
    if (this.languageLabels.size > 0) {

      this.languageLabels.forEach((value, code) => {
        if (code.length < 3) {
          return;
        }
      
        output.push(code.charCodeAt(0));
        output.push(code.charCodeAt(1));
        output.push(code.charCodeAt(2));
        new RcpString(value).write(output);
      });
    }

    output.push(0);
  }

  writeDescription(output: number[]) {

    // concat label and all language-labels
    if (this._description) {
        output.push("any".charCodeAt(0));
        output.push("any".charCodeAt(1));
        output.push("any".charCodeAt(2));
        new RcpString(this._description).write(output);
    }
    if (this.languageDescriptions.size > 0) {

      this.languageDescriptions.forEach((value, code) => {
        if (code.length < 3) {
          return;
        }
      
        output.push(code.charCodeAt(0));
        output.push(code.charCodeAt(1));
        output.push(code.charCodeAt(2));
        new RcpString(value).write(output);
      });
    }

    output.push(0);
  }

  writeOptions(output: Array<number>, all: boolean) : void {

    let ch = this.changed;
    if (all)
    {
      ch = Parameter.allOptions;
    }

    // TODO: get hold of last option... to mask option id

    const keys = Array.from(ch.keys());
    for (let i = 0; i < keys.length; i++)
    {
      const key = keys[i];

      if (key > RcpTypes.ParameterOptions.VALUE &&
          key <= RcpTypes.ParameterOptions.ENABLED)
      {
        // write options id
        output.push(key | ((i === keys.length-1) ? RcpInt.TERMINATOR : 0));
      }

      switch (key)
      {
        case RcpTypes.ParameterOptions.VALUE:
          // NOTE: handled in ValueParameter
          break;

        case RcpTypes.ParameterOptions.LABEL: {
          if (this._label || this.languageLabels.size > 0) {
            this.writeLabel(output);
          } else {
            // label was erased
            output.push(RcpInt.TERMINATOR);
          }
          break;
        }

        case RcpTypes.ParameterOptions.DESCRIPTION: {
          if (this._description || this.languageDescriptions.size > 0) {
            this.writeDescription(output)            
          } else {
            // description was erased
            output.push(RcpInt.TERMINATOR);
          }
          break;
        }

        case RcpTypes.ParameterOptions.TAGS: {
          new RcpString(this._tags || "").write(output);
          break;
        }

        case RcpTypes.ParameterOptions.ORDER: {
          new RcpInt(this._order || 0).write(output);
          break;
        }

        case RcpTypes.ParameterOptions.PARENTID: {
          new RcpInt(this._parent?.id || 0).write(output);          
          break;
        }

        case RcpTypes.ParameterOptions.WIDGET: {
        //   if (this._widget) {
        //     this._widget.write(output, all);
        //   } else {
        //     output.push(RcpTypes.TERMINATOR);
        //   }
          console.log("TODO: write widget data")
          break;
        }

        case RcpTypes.ParameterOptions.USERDATA: {
          if (this._userdata != undefined) {
            this._userdata?.write(output, all);
          } else {
            new RcpInt(0).write(output);
          }
          break;
        }

        case RcpTypes.ParameterOptions.USERID: {
          new RcpString(this._userid || "").write(output);          
          break;
        }

        case RcpTypes.ParameterOptions.READONLY: {
          if (this._readonly) {
            output.push(this._readonly ? 1 : 0);
          } else {
            output.push(0);
          }
          break;
        }

        case RcpTypes.ParameterOptions.ENABLED: {
          if (this._enabled) {
            output.push(this._enabled ? 1 : 0);
          } else {
            output.push(0);
          }
          break;
        }

        default:
          console.log("unknown parameter option", key);
          break;
      }
    }

    if (!all) {
      this.changed.clear();
    }
  }

  // implement interface Writable
  write(output: Array<number>, all: boolean): void {

    // write id
    new RcpInt(this.id).write(output);

    // typedefinition
    this.typeDefinition.write(output, all);

    // write options
    this.writeOptions(output, all);
  }

  handleOption(optionId: number, io: KaitaiStream): boolean {
    return false;
  }

  parseOptions(io: KaitaiStream, hasTypeOptions: boolean) {

    // parse mandatory first!
    this.typeDefinition.readMandatory(io);

    // first parse type options
    if (hasTypeOptions)
    {
      this.typeDefinition.parseOptions(io);
    }

    while (true)
    {
      if (io.isEof())
      {        
        break;
      }

      // read option
      const v = io.readU1();
      const optionId = v & ~RcpInt.TERMINATOR;

      if (optionId == 0)
      {
        // terminator
        break;
      }

      switch (optionId) {
        case RcpTypes.ParameterOptions.LABEL: {

            let current = io.pos;
            let ppeekk  = io.readS1();
  
            // NOTE: Rcp-Int 128 = value: 0
            while (ppeekk > 0 &&
                   ppeekk != 128)
            {
                // rewind one
                io.seek(current);
  
                const lang_code = KaitaiStream.bytesToStr(io.readBytes(3), "utf8");
                const label     = RcpString.parse(io).value
  
                if (label) {
                  if (lang_code === "any") {
                      console.log("any language label: " + label);
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
  
          while (ppeekk > 0 &&
                 ppeekk != 128)
          {
  
              // rewind one
              io.seek(current);
  
              const lang_code = KaitaiStream.bytesToStr(io.readBytes(3), "utf8");
              const description = RcpString.parse(io).value;
  
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
          this._tags = RcpString.parse(io).value;
          break;

        case RcpTypes.ParameterOptions.ORDER:
          this._order = RcpInt.parse(io).value;
          break;

        case RcpTypes.ParameterOptions.PARENTID:
        {
          const parentid = RcpInt.parse(io).value;

          if (this.manager)
          {
            if (parentid === 0) 
            {
              this._parent = this.manager.getRootGroup();
            } 
            else
            {
              // try to get parent from cache
              const parent = this.manager.getParameter(parentid) as GroupParameter;
              
              // TODO: deal with missing parents
              if (parent !== undefined)
              {
                this._parent = parent;
              }
              else
              {
                // parent could not be found
                this.manager.waitForParent(this.id, parentid);
              }
            }
          }
        }
          break;

        case RcpTypes.ParameterOptions.WIDGET:
          this._widget = Widget.parse(io);
          // this._widget = parseWidget(io, this);
          break;

        case RcpTypes.ParameterOptions.USERDATA:
          this._userdata = UserData.parse(io);
          break;

        case RcpTypes.ParameterOptions.USERID:
          this._userid = RcpString.parse(io).value;
          break;

        case RcpTypes.ParameterOptions.READONLY:
          this._readonly = io.readS1() > 0;
          break;

        case RcpTypes.ParameterOptions.ENABLED:
          this._readonly = io.readS1() > 0;
          break;

        case RcpTypes.ParameterOptions.VALUE:        
        default:
          if (!this.handleOption(optionId, io)) {
            throw new Error("parameter option not handled: " + optionId);
          }
          break;
      }

      if (v & RcpInt.TERMINATOR)
      {
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
    this.changed.add(RcpTypes.ParameterOptions.LABEL);
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
    this.changed.add(RcpTypes.ParameterOptions.LABEL);
    this.setDirty();
  }

  setLanguageLabel(code: string, label: string) {
    this.languageLabels.set(code, label);
    this.changed.add(RcpTypes.ParameterOptions.LABEL);
    this.setDirty();
  }

  removeLanguageLabel(code: string) {
    this.languageLabels.delete(code);
    this.changed.add(RcpTypes.ParameterOptions.LABEL);
    this.setDirty();
  }

  //--------------------------------
  // description
  set description(description: string | undefined) {
    if (this._description === description) {
      return;
    }

    this._description = description;
    this.changed.add(RcpTypes.ParameterOptions.DESCRIPTION);
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
    this.changed.add(RcpTypes.ParameterOptions.DESCRIPTION);
    this.setDirty();
  }

  setLanguageDescription(code: string, description: string) {
    this.languageDescriptions.set(code, description);
    this.changed.add(RcpTypes.ParameterOptions.DESCRIPTION);
    this.setDirty();
  }

  removeLanguageDescription(code: string) {
    this.languageDescriptions.delete(code);
    this.changed.add(RcpTypes.ParameterOptions.DESCRIPTION);
    this.setDirty();
  }

  //--------------------------------
  // tags
  set tags(tags: string | undefined) {
    if (this._tags === tags) {
      return;
    }

    this._tags = tags;
    this.changed.add(RcpTypes.ParameterOptions.TAGS);
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
    this.changed.add(RcpTypes.ParameterOptions.ORDER);
    this.setDirty();
  }

  get order(): number | undefined {
    return this._order;
  }

  //--------------------------------
  // parent
  set parent(parent: GroupParameter | undefined)
  {    
    if (this._parent !== undefined && 
        parent !== undefined && 
        this._parent.id === parent.id)
    {
      return;
    }

    this.setParentDirect(parent);

    this.changed.add(RcpTypes.ParameterOptions.PARENTID);
    this.setDirty();
  }

  get parent(): GroupParameter | undefined {
    return this._parent;
  }

  setParentDirect(parent: GroupParameter | undefined)
  {
    this.removeFromParent();
    this._parent = parent;
    if (this._parent !== undefined)
    {
      this._parent.addChild(this);    
    }
  }

  //--------------------------------
  // widget
  set widget(widget: Widget | undefined) {
    this._widget = widget;

    if (this._widget) {
      this._widget.parameter = this
    }

    this.changed.add(RcpTypes.ParameterOptions.WIDGET);
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
    this.changed.add(RcpTypes.ParameterOptions.USERDATA);
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
    this.changed.add(RcpTypes.ParameterOptions.USERID);
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
    this.changed.add(RcpTypes.ParameterOptions.READONLY);
    this.setDirty();
  }

  get readonly(): boolean | undefined{
    return this._readonly;
  }

  //--------------------------------
  // enabled
  set enabled(value: boolean | undefined) {
    if (this._enabled === value) {
      return;
    }

    this._enabled = value;
    this.changed.add(RcpTypes.ParameterOptions.ENABLED);
    this.setDirty();
  }

  get enabled(): boolean | undefined{
    return this._enabled;
  }

}