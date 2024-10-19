import {
  html,
  LitElement,
  TemplateResult,
  property,
  customElement,
  query,
} from "lit-element";
import {
  MenuPosition,
  newResetPluginsEvent,
  newSetPluginsEvent,
  PluginKind,
  Plugin,
  newAddExternalPluginEvent,
} from "../open-scd";
import { get } from 'lit-translate';
import type { Select } from '@material/mwc-select';
import type { Switch } from '@material/mwc-switch';
import type { TextField } from '@material/mwc-textfield';
import { List } from '@material/mwc-list';
import type { ListItem } from '@material/mwc-list/mwc-list-item';
import '@material/mwc-dialog'
import type { Dialog } from '@material/mwc-dialog';

@customElement('oscd-plugin-installer')
export class PluginInstaller extends LitElement {

  @query("mwc-dialog") dialog?: Dialog
  @query('#pluginSrcInput') pluginSrcInput?: TextField
  @query('#pluginNameInput') pluginNameInput?: TextField
  @query('#pluginKindList') pluginKindList?: List
  @query('#requireDoc') requireDoc?: Switch
  @query('#menuPosition') positionList?: Select

  public render(){
    return html`
      <mwc-dialog
        id="pluginAdd"
        heading="${get('plugins.add.heading')}"
      >
        <div style="display: flex; flex-direction: column; row-gap: 8px;">
          <p style="color:var(--mdc-theme-error);">
            ${get('plugins.add.warning')}
          </p>
          <mwc-textfield
            label="${get('plugins.add.name')}"
            helper="${get('plugins.add.nameHelper')}"
            required
            id="pluginNameInput"
          ></mwc-textfield>

          <mwc-list id="pluginKindList">
            <mwc-radio-list-item
              id="editor"
              value="editor"
              hasMeta
              selected
              left
            >
              ${get('plugins.editor')}
              <mwc-icon slot="meta">
                ${pluginIcons['editor']}
              </mwc-icon>
            </mwc-radio-list-item>

            <mwc-radio-list-item
              value="menu"
              hasMeta
              left
            >
              ${get('plugins.menu')}
              <mwc-icon slot="meta">
                ${pluginIcons['menu']}
              </mwc-icon>
            </mwc-radio-list-item>
            <div id="menudetails">
              <mwc-formfield
                id="enabledefault"
                label="${get('plugins.requireDoc')}"
              >
                <mwc-switch
                  id="requireDoc"
                  checked>
                </mwc-switch>
              </mwc-formfield>
              <mwc-select
                id="menuPosition"
                value="middle"
                fixedMenuPosition
              >
                ${Object.values(menuPosition).map(
                  menutype => html`
                    <mwc-list-item value="${menutype}">
                      ${get('plugins.' + menutype)}
                    </mwc-list-item>
                  `
                )}
              </mwc-select>
            </div>
            <mwc-radio-list-item
              id="validator"
              value="validator"
              hasMeta
              left
            >
              ${get('plugins.validator')}
              <mwc-icon slot="meta">
                ${pluginIcons['validator']}
              </mwc-icon>
            </mwc-radio-list-item>
          </mwc-list>
          <mwc-textfield
            label="${get('plugins.add.src')}"
            helper="${get('plugins.add.srcHelper')}"
            placeholder="http://example.com/plugin.js"
            type="url"
            required
            id="pluginSrcInput"
          ></mwc-textfield>
        </div>
        <mwc-button
          slot="secondaryAction"
          dialogAction="close"
          label="${get('cancel')}"
        ></mwc-button>
        <mwc-button
          slot="primaryAction"
          icon="add"
          label="${get('add')}"
          trailingIcon
          @click=${() => this.handleAddPlugin()}
        ></mwc-button>
      </mwc-dialog>

      <style>
        #menudetails {
          display: none;
          padding: 20px;
          padding-left: 50px;
        }
        #pluginKindList [value="menu"][selected] ~ #menudetails {
          display: grid;
        }
        #enabledefault {
          padding-bottom: 20px;
        }
        #menuPosition {
          max-width: 250px;
        }
      </style>
    `;
  }

  public show(){
    this.dialog?.show()
  }

  public close(){
    this.dialog?.close()
  }

  public setPluginName(name: string){
    if(!this.pluginNameInput) { return; }

    this.pluginNameInput.value = name
  }

  public setPluginSrc(src: string){
    if(!this.pluginSrcInput) { return; }

    this.pluginSrcInput.value = src
  }

  private handleAddPlugin() {

    const hasAllTheConfigs =
      this.pluginSrcInput?.checkValidity() &&
      this.pluginNameInput?.checkValidity() &&
      this.pluginKindList?.selected &&
      this.requireDoc &&
      this.positionList?.selected

    if (!hasAllTheConfigs) { return; }

    const eventDetails = {
      src: this.pluginSrcInput!.value,
      name: this.pluginNameInput!.value,
      kind: <PluginKind>(<ListItem>this.pluginKindList!.selected).value,
      requireDoc: this.requireDoc!.checked,
      position: <MenuPosition>this.positionList!.value, 
      installed: true,
    }
    const event = newAddExternalPluginEvent(eventDetails)

    this.dispatchEvent( event );
    this.close()

    // TODO: do I need `requestUpdate` and `this.pluginUI.requestUpdate`
    // this.requestUpdate();
    // this.pluginUI.requestUpdate();
    // this.pluginDownloadUI.close();
  }

}



export const pluginIcons: Record<PluginKind | MenuPosition, string> = {
  editor: 'tab',
  menu: 'play_circle',
  validator: 'rule_folder',
  top: 'play_circle',
  middle: 'play_circle',
  bottom: 'play_circle',
};

export const menuPosition = ['top', 'middle', 'bottom'] as const;
