import { expect, fixture, html } from '@open-wc/testing';

import '../mock-open-scd.js';
import { MockOpenSCD } from '../mock-open-scd.js';

import { TextField } from '@material/mwc-textfield';
import { PluginInstaller } from '../../src/addons/plugins.installer';

describe('OpenSCD-Plugin', () => {
  let element: MockOpenSCD;
  let pluginInstaller: PluginInstaller | undefined
  let doc: XMLDocument;
  const docName = 'testDoc';

  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 50)); // await animation
    localStorage.clear();
  });
  beforeEach(async () => {
    doc = await fetch('/test/testfiles/valid2007B4.scd')
      .then(response => response.text())
      .then(str => new DOMParser().parseFromString(str, 'application/xml'));

    element = <MockOpenSCD>(
      await fixture(
        html`<mock-open-scd .doc=${doc} .docName=${docName}></mock-open-scd>`
      )
    );
    pluginInstaller = element.layout.pluginInstallerElement;
    console.log("pluginInstaller",pluginInstaller, pluginInstaller?.shadowRoot?.querySelector('mwc-button'))

    await element.updateComplete;
  });

  it('stores default plugins on load', () =>{
    expect(element.layout).property('editors').to.have.lengthOf(6)
  });

  it('has Locale property', async () => {
    expect(element).to.have.property('locale');
  });

  it('has docs property', () => {
    expect(element).to.have.property(`docs`).that.is.a('Object');
    expect(element.docs[docName]).to.equal(doc);
  });

  describe('plugin manager dialog', () => {
    let firstEditorPlugin: HTMLElement;
    let resetAction: HTMLElement;
    let primaryAction: HTMLElement;

    beforeEach(async () => {
      element.layout.pluginUI.show();
      await element.layout.pluginUI.updateComplete;
      firstEditorPlugin = <HTMLElement>(
        element.layout.pluginList.querySelector(
          'mwc-check-list-item:not([noninteractive])'
        )
      );

      resetAction = <HTMLElement>(
        element.layout.pluginUI.querySelector('mwc-button[slot="secondaryAction"]')
      );
      primaryAction = <HTMLElement>(
        element.layout.pluginUI.querySelector('mwc-button[slot="primaryAction"]')
      );
    });

    it('disables deselected plugins', async () => {
      firstEditorPlugin.click();
      await element.updateComplete;
      expect(element.layout).property('editors').to.have.lengthOf(5);
    });

    it('enables selected plugins', async () => {
      (<HTMLElement>element.layout.pluginList.firstElementChild).click();
      await element.updateComplete;
      (<HTMLElement>element.layout.pluginList.firstElementChild).click();
      await element.updateComplete;
      expect(element.layout).property('editors').to.have.lengthOf(6);
    });

    it('resets plugins to default on reset button click', async () => {
      (<HTMLElement>element.layout.pluginList.firstElementChild).click();
      await element.updateComplete;
      resetAction.click();
      await element.updateComplete;
      expect(element.layout).property('editors').to.have.lengthOf(6);
    });

    it('opens the custom plugin dialog on add button click', async () => {
      primaryAction.click();
      await element.updateComplete;
      expect(element.layout)
        .property('pluginInstallerElement')
        .to.have.property('open', true);
    });
  });

  describe('add custom plugin dialog', () => {
    let pluginSrc: TextField;
    let pluginName: TextField;
    let primaryAction: HTMLElement;
    let menuKindOption: HTMLElement;
    let validatorKindOption: HTMLElement;

    beforeEach(async () => {
      pluginSrc = <TextField>(element.layout.pluginInstallerElement?.pluginSrcInput);
      pluginName = <TextField>(element.layout.pluginInstallerElement?.pluginNameInput);
      primaryAction = <HTMLElement>(
        element.layout.pluginInstallerElement?.shadowRoot?.querySelector(
        'mwc-button[slot="primaryAction"]'
        )
      );
      element.layout.openPluginInstaller();
      await element.layout.pluginInstallerElement?.updateComplete;
      await element.updateComplete;
      menuKindOption = <HTMLElement>(
        element.layout.pluginInstallerElement?.querySelector(
          '#pluginKindList > mwc-radio-list-item[value="menu"]'
        )
      );
      validatorKindOption = <HTMLElement>(
        element.layout.pluginInstallerElement?.querySelector(
          '#pluginKindList > mwc-radio-list-item[id="validator"]'
        )
      );
    });


    describe('requires a name and a valid URL to add a plugin', async () => {

      it('does not add without user interaction', async () => {
        primaryAction.click();
        expect(element.layout.pluginInstallerElement).to.have.property('open', true);
      })

      it('does not add without a name', async () => {
        pluginSrc.value = 'http://example.com/plugin.js';
        await pluginSrc.updateComplete;
        primaryAction.click();
        expect(element.layout.pluginInstallerElement).to.have.property('open', true);
      })

      it('does not add plugin with incorrect url', async () => {
        pluginSrc.value = 'notaURL';
        pluginName.value = 'testName';
        await pluginSrc.updateComplete;
        await pluginName.updateComplete;
        primaryAction.click();
        expect(element.layout.pluginInstallerElement).to.have.property('open', true);
      });


      it('adds a plugin with a name and a valid URL', async () => {
        pluginName.value = 'testName';
        await pluginName.updateComplete;

        pluginSrc.value = 'http://localhost:8080/plugin/plugin.js';
        await pluginSrc.updateComplete;

        primaryAction.click();

        expect(element.layout.pluginInstallerElement).to.have.property('open', false);
      }).timeout(600_000);

    });

    it.only('adds a new editor kind plugin on add button click', async (done) => {
      pluginInstaller?.setPluginSrc('http://example.com/plugin.js')
      pluginInstaller?.setPluginName('testName')
      await pluginInstaller?.updateComplete
      primaryAction.click();
      // await element.updateComplete;
      expect(element.layout.editors).to.have.lengthOf(7);
    // })
    }).timeout(600_000);

    it('adds a new menu kind plugin on add button click', async () => {
      const lengthMenuKindPlugins = element.layout.menuEntries.length;
      pluginSrc.value = 'http://example.com/plugin.js';
      pluginName.value = 'testName';
      menuKindOption.click();
      await pluginSrc.updateComplete;
      await pluginName.updateComplete;
      primaryAction.click();
      await element.updateComplete;
      expect(element.layout.menuEntries).to.have.lengthOf(lengthMenuKindPlugins + 1);
    });

    it('sets requireDoc and position for new menu kind plugin', async () => {
      pluginSrc.value = 'http://example.com/plugin.js';
      pluginName.value = 'testName';
      menuKindOption.click();
      await pluginSrc.updateComplete;
      await pluginName.updateComplete;
      primaryAction.click();
      await element.updateComplete;

      expect(
        element.layout.menuEntries[element.layout.menuEntries.length - 1]
      ).to.have.property('requireDoc');
      expect(
        element.layout.menuEntries[element.layout.menuEntries.length - 1]
      ).to.have.property('position');
    });
    it('adds a new validator kind plugin on add button click', async () => {
      expect(element.layout.validators).to.have.lengthOf(2);
      pluginSrc.value = 'http://example.com/plugin.js';
      pluginName.value = 'testName';
      validatorKindOption.click();
      await pluginSrc.updateComplete;
      await pluginName.updateComplete;
      primaryAction.click();
      await element.updateComplete;
      expect(element.layout.validators).to.have.lengthOf(3);
    });
  });
});
