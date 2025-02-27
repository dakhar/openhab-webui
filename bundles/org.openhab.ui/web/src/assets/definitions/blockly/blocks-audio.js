/*
* Notes:
* - Master volume has been removed as it isn't reliable in openhab: see https://github.com/openhab/openhab-distro/issues/1237
* - Play or streaming from the default sink have been omitted as they are felt not be so useful.
* - It is known that "webaudio" isn't working on OH3 at the moment: https://github.com/openhab/openhab-webui/issues/743
* - Even though "enhancedjavasound" is provided as a sink, currently it is not clear what the intention is
*
* See more background info on openHAB multimedia here: https://www.openhab.org/docs/configuration/multimedia.html
*/

import Blockly from 'blockly'
import { FieldSlider } from '@blockly/field-slider'

export default function (f7, sinks, voices) {
  Blockly.Blocks['oh_volumeslider'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new FieldSlider(50), 'volume')
      this.setColour(210)
      this.setInputsInline(true)
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_volumeslider'] = function (block) {
    const fieldName = block.getFieldValue('volume')
    let code = `'${fieldName}'`
    return [code, 0]
  }

  /*
  * Plays a file (like mp3) which resides in conf/sounds to the given sink
  * Blockly part
  */
  Blockly.Blocks['oh_playmedia_sink'] = {
    init: function () {
      this.appendValueInput('fileName')
        .appendField('play audio')
        .setCheck('String')
      this.appendValueInput('sinkName')
        .setCheck(null)
        .appendField('on')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Plays a sound file from the sounds folder to the given sink.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/multimedia.html')
    }
  }

  /*
  * Plays a file (like mp3) which resides in conf/sounds to the given sink
  * Code part
  */
  Blockly.JavaScript['oh_playmedia_sink'] = function (block) {
    addAudio()
    let fileName = Blockly.JavaScript.valueToCode(block, 'fileName', Blockly.JavaScript.ORDER_ATOMIC)
    let sinkName = Blockly.JavaScript.valueToCode(block, 'sinkName', Blockly.JavaScript.ORDER_ATOMIC).replace('(', '').replace(/[()]/g, '')

    let code = `audio.playSound(${sinkName}, ${fileName});\n`
    return code
  }

  /*
  * Plays a file (like mp3) which resides in conf/sounds to the given sink at a given volume
  * Blockly part
  */
  Blockly.Blocks['oh_playmedia_sink_volume'] = {
    init: function () {
      this.appendValueInput('fileName')
        .appendField('play audio')
        .setCheck('String')
      this.appendValueInput('sinkName')
        .setCheck(null)
        .appendField('on')
      this.appendValueInput('volume')
        .setCheck(null)
        .appendField('at volume')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Plays a sound file from the sounds folder to the given sink at a given volume. \n Note: rather set volume first via thing volume channel, then play sound without volume parameter as it may be more reliable.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/multimedia.html')
    }
  }

  /*
  * Plays a file (like mp3) which resides in conf/sounds to the given sink at a given volume
  * Note: In general, though more complex, rather create a volume item for that device and set the volume first as it is more reliable.
  * Code part
  */
  Blockly.JavaScript['oh_playmedia_sink_volume'] = function (block) {
    addAudio()
    let fileName = Blockly.JavaScript.valueToCode(block, 'fileName', Blockly.JavaScript.ORDER_ATOMIC)
    let sinkName = Blockly.JavaScript.valueToCode(block, 'sinkName', Blockly.JavaScript.ORDER_ATOMIC).replace('(', '').replace(/[()]/g, '')
    let volume = Blockly.JavaScript.valueToCode(block, 'volume', Blockly.JavaScript.ORDER_ATOMIC).replace(/'/g, '')

    let code = `audio.playSound(${sinkName}, ${fileName}, new PercentType(${volume}));\n`
    return code
  }

  /*
  * Plays a stream from a URL on a specific sink
  * Blockly part
  */
  Blockly.Blocks['oh_playstream_sink'] = {
    init: function () {
      this.appendValueInput('url')
        .appendField('play stream')
        .setCheck('String')
      this.appendValueInput('sinkName')
        .setCheck(null)
        .appendField('on')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('plays an audio stream from an url to the given sink(s)')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/multimedia.html')
    }
  }

  /*
  * Plays a stream from a URL on a specific sink
  * Blockly part
  */
  Blockly.JavaScript['oh_playstream_sink'] = function (block) {
    addAudio()
    let url = Blockly.JavaScript.valueToCode(block, 'url', Blockly.JavaScript.ORDER_ATOMIC)
    let sinkName = Blockly.JavaScript.valueToCode(block, 'sinkName', Blockly.JavaScript.ORDER_ATOMIC).replace('(', '').replace(/[()]/g, '')
    let code = `audio.playStream(${sinkName}, ${url});\n`
    return code
  }

  /*
  * Stops a stream at a specific sink
  * Blockly part
  */
  Blockly.Blocks['oh_stopstream_sink'] = {
    init: function () {
      this.appendValueInput('sinkName')
        .setCheck(null)
        .appendField('stop stream on')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('stops the audio stream at the given sink')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/multimedia.html')
    }
  }

  /*
  * Stops a stream on a specific sink
  * Blockly part
  */
  Blockly.JavaScript['oh_stopstream_sink'] = function (block) {
    addAudio()
    let url = block.getFieldValue('url')
    let sinkName = Blockly.JavaScript.valueToCode(block, 'sinkName', Blockly.JavaScript.ORDER_ATOMIC).replace('(', '').replace(/[()]/g, '')
    let code = `audio.playStream(${sinkName}, null);\n`
    return code
  }

  /*
  * Says some words via a device sink - TTS has to be installed for that
  * Blockly part
  */
  Blockly.Blocks['oh_say'] = {
    init: function () {
      this.appendValueInput('textToSay')
        .appendField('say')
      this.appendValueInput('deviceSink')
        .appendField('on')
        .setCheck('String')
      this.appendValueInput('voice')
        .appendField('with')
        .setCheck('String')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Speak text at the given device via text-to-speech')
      this.setHelpUrl('https://www.openhab.org/addons/voice/googletts/')
    }
  }

  /*
  * Says some text via a device sink - TTS has to be installed for that
  * Code part
  */
  Blockly.JavaScript['oh_say'] = function (block) {
    const voiceName = Blockly.JavaScript.provideFunction_(
      'voice',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.Voice\');'])

    const textToSay = Blockly.JavaScript.valueToCode(block, 'textToSay', Blockly.JavaScript.ORDER_ATOMIC)
    const voice = Blockly.JavaScript.valueToCode(block, 'voice', Blockly.JavaScript.ORDER_ATOMIC).replace('(', '').replace(/[()]/g, '')
    const deviceSink = Blockly.JavaScript.valueToCode(block, 'deviceSink', Blockly.JavaScript.ORDER_ATOMIC).replace('(', '').replace(/[()]/g, '')

    const code = `voice.say(${textToSay}, ${voice}, ${deviceSink});\n`
    return code
  }

  /*
  * Provides all available audio sinks as a dropdown
  */
  Blockly.Blocks['oh_audiosink_dropdown'] = {
    init: function () {
      let input = this.appendDummyInput()
        .appendField('audio sink')
        .appendField(new Blockly.FieldDropdown(this.generateOptions), 'sinks')
      this.setOutput(true, null)
    },
    generateOptions: function () {
      let options = []
      if (sinks != null && sinks.length > 0) {
        for (let key in sinks) {
          let sinkOption = sinks[key]
          options.push([sinkOption.label, sinkOption.id])
        }
      } else {
        options.push(['(none)', ''])
      }
      return options
    }
  }

  Blockly.JavaScript['oh_audiosink_dropdown'] = function (block) {
    let sinkName = block.getFieldValue('sinks')
    return [`'${sinkName}'`, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Provides all available voices as a dropdown
  */

  Blockly.Blocks['oh_voices_dropdown'] = {
    init: function () {
      let input = this.appendDummyInput()
        .appendField('voice')
        .appendField(new Blockly.FieldDropdown(this.generateOptions), 'voiceName')
      this.setOutput(true, null)
    },
    generateOptions: function () {
      let options = []
      if (voices != null && voices.length > 0) {
        for (let key in voices) {
          let voicesOption = voices[key]
          options.push([voicesOption.label, voicesOption.id])
        }
      } else {
        options.push(['(none)', ''])
      }
      return options
    }
  }

  Blockly.JavaScript['oh_voices_dropdown'] = function (block) {
    let voiceName = block.getFieldValue('voiceName')
    return [`'${voiceName}'`, Blockly.JavaScript.ORDER_NONE]
  }

  function addAudio () {
    Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.Audio\');'])
  }
}
