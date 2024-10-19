import {
  html,
  LitElement,
  TemplateResult,
  property,
  customElement,
  query,
} from "lit-element";
import { get } from 'lit-translate';
import type { MultiSelectedEvent } from '@material/mwc-list/mwc-list-foundation.js';
import {
  MenuPosition,
  newResetPluginsEvent,
  newSetPluginsEvent,
  PluginKind,
  Plugin,
} from "../open-scd";
import type { Dialog } from '@material/mwc-dialog';

export const pluginIcons: Record<PluginKind | MenuPosition, string> = {
  editor: 'tab',
  menu: 'play_circle',
  validator: 'rule_folder',
  top: 'play_circle',
  middle: 'play_circle',
  bottom: 'play_circle',
};

@customElement('oscd-plugin-list')
export class PluginList extends LitElement {

  @query('mwc-dialog') dialog?: Dialog

  @property({ type: Array })
  _plugins: Plugin[] = [];

  set plugins(plugins: Plugin[]){
    this._plugins = plugins;
    console.log("new plugins array", plugins)
  }

  get plugins(){
    return this._plugins;
  }


  public render(){
    return html`
    <mwc-dialog
      stacked
      id="pluginManager"
      heading="${get('plugins.heading')}"
    >
      <mwc-list
        id="pluginList"
        multi
        @selected=${(e: MultiSelectedEvent) => {
          console.log("plugin.list: dispatching newSetPluginsEvent",e.detail.index)
          this.dispatchEvent(newSetPluginsEvent(e.detail.index))}
        }
      >
        <mwc-list-item graphic="avatar" noninteractive>
          <strong>${get(`plugins.editor`)}</strong>
          <mwc-icon slot="graphic" class="inverted">
            ${pluginIcons['editor']}
          </mwc-icon>
        </mwc-list-item>
        <li divider role="separator"></li>
          ${this.renderPluginKind(
            'editor',
            this.plugins.filter(p => p.kind === 'editor')
          )}
        <mwc-list-item graphic="avatar" noninteractive>
          <strong>${get(`plugins.menu`)}</strong>
          <mwc-icon slot="graphic" class="inverted">
            <strong>${pluginIcons['menu']}</strong>
          </mwc-icon>
        </mwc-list-item>
        <li divider role="separator"></li>
          ${this.renderPluginKind(
            'top',
            this.plugins.filter(p => p.kind === 'menu' && p.position === 'top')
          )}
        <li divider role="separator" inset></li>
          ${this.renderPluginKind(
            'validator',
            this.plugins.filter(p => p.kind === 'validator')
          )}
        <li divider role="separator" inset></li>
          ${this.renderPluginKind(
            'middle',
            this.plugins.filter(
              p => p.kind === 'menu' && p.position === 'middle'
            )
          )}
        <li divider role="separator" inset></li>
          ${this.renderPluginKind(
            'bottom',
            this.plugins.filter(
              p => p.kind === 'menu' && p.position === 'bottom'
            )
          )}
      </mwc-list>
      <mwc-button
        slot="secondaryAction"
        icon="refresh"
        label="${get('reset')}"
        @click=${async () => {
          this.dispatchEvent(newResetPluginsEvent());
          this.requestUpdate();
        }}
        style="--mdc-theme-primary: var(--mdc-theme-error)"
      >
      </mwc-button>
      <mwc-button
        slot="secondaryAction"
        icon=""
        label="${get('close')}"
        dialogAction="close"
      ></mwc-button>
      <mwc-button
        outlined
        trailingIcon
        slot="primaryAction"
        icon="library_add"
        label="${get('plugins.add.heading')}&hellip;"
        @click=${this.dispatchInstallPluginEvent}
      ></mwc-button>
    </mwc-dialog>
  `;

  }

  public show(){
    this.dialog?.show();
  }

  public close(){
    this.dialog?.close();
  }

  private renderPluginKind(
    type: PluginKind | MenuPosition,
    plugins: Plugin[]
  ): TemplateResult {

    const content = plugins.map( plugin => {
      console.log("renderPluginKind", plugin.name, plugin.default, plugin.installed)
      return html`
        <mwc-check-list-item
            class="${plugin.official ? 'official' : 'external'}"
            value="${plugin.src}"
            ?selected=${plugin.installed}
            @request-selected=${(e: Event) => {
              console.log("request-selected",plugin.name, e.detail.source)
              if(e.detail.source !== 'interaction'){
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
              }

            }}
            hasMeta
            left
          >
            <mwc-icon slot="meta">
              ${plugin.icon || pluginIcons[plugin.kind]}
            </mwc-icon>
            ${plugin.name}
          </mwc-check-list-item>
      `
    })

    return html`${content}`
  }



  private dispatchInstallPluginEvent(){
    this.dispatchEvent(new CustomEvent('install-plugin', {
      bubbles: true,
      composed: true,
    }));
  }


}
