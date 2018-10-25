// edit panel variables
ELEMENT.locale(ELEMENT.lang.en);
var vue = undefined;
var editCanvas = undefined;
var editButton = undefined;

function getRGBValuesFromString(color) {
  var newColor = "";
  for (var i = 0; i < color.length; ++i) {
    var c = color[i];
    switch (c) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case ',':
        newColor += c;
        break;
    }
  }
  return newColor;
}

vue = new Vue({
  el: '#root',

  data: {
    editText: '',
    colors: [
      //{ color: '#FF0000' },
    ],
    thresholds: [
      //{ threshold: 0, max: 255, step: 1},
    ],
    layers: [
      { value: "../ChromaCommon/animations/BarrelFlash1_Keyboard.chroma" }
    ],
    layerOptions: [
      //{ label: "BarrelFlash1", value: "../ChromaCommon/animations/BarrelFlash1_Keyboard.chroma" }
    ],
    predefineColors: [
      '#ff0000',
      '#ff4500',
      '#ff8c00',
      '#ffd700',
      '#ffff00',
      '#90ee90',
      '#00ffff',
      '#1e90ff',
      '#c71585',
      '#ff00ff'
    ]
  },

  methods: {

    convertIntToHex(value) {
      var result = value.toString(16);
      if (result.length == 1) {
        return "0" + result;
      }
      return result;
    },

    hexToRGB(hex) {
      if (hex.indexOf("#") >= 0) {
        var color = parseInt("0x" + hex.substring(1));
        var blue = color & 0xFF;
        var green = (color & 0xFF00) >> 8;
        var red = (color & 0xFF0000) >> 16;
        return getRGBString(red, green, blue);
      } else {
        return "rgb(255, 255, 255)";
      }
    },

    getEditLayer(layerIndex) {
      var c = 0;
      for (var i = 0; i < vue.$children.length; ++i) {
        if (vue.$children[i].constructor.options.name == "ElSelect") {
          if (c == layerIndex) {
            var layer = vue.$children[i].value;
            if (layer != undefined) {
              return layer;
            }
            return "";
          }
          ++c;
        }
      }
      return "";
    },

    getEditColor(colorIndex) {
      var c = 0;
      for (var i = 0; i < vue.$children.length; ++i) {
        if (vue.$children[i].constructor.options.name == "ElColorPicker") {
          //console.log('color picker', vue.$children[i]._data.color.value);
          if (c == colorIndex) {
            var color = vue.$children[i]._data.color.value;
            if (color != undefined) {
              return this.hexToRGB(color);
            }
            return "rgb(255, 255, 255)";
          }
          ++c;
        }
      }
      return "rgb(255, 255, 255)";
    },

    getEditThreshold(thresholdIndex) {
      var threshold = vue._data.thresholds[thresholdIndex].threshold
      if (threshold == undefined) {
        return 255;
      }
      return threshold;
    },

    setEditColor(colorIndex, hex) {
      vue._data.colors[colorIndex].color = hex;
    },

    modifyEditLayer(lines, i, layerIndex, token) {
      var line = lines[i];

      try {
        var index = line.indexOf(token);
        if (index >= 0) {
          //console.log('before', 'layerIndex', layerIndex, line);

          var first = index + token.length;
          var start = undefined;
          for (var j = first; j < line.length; ++j) {
            if (line[j] == '"' || line[j] == "'") {
              if (start == undefined) {
                start = j;
              } else {
                var layer = this.getEditLayer(layerIndex);
                //console.log(layerIndex, 'layer', layer);
                ++layerIndex;
                line = line.substring(0, start+1) + layer + line.substring(j);
                break;
              }
            }
          }

          //console.log('after', 'layerIndex', layerIndex, line);
          lines[i] = line;
        }
      } catch (err) {
        console.error('layerIndex', layerIndex, err);
      }
      return layerIndex;
    },

    modifyEditThreshold(lines, i, thresholdIndex, token, arg) {
      var line = lines[i];

      try {
        var index = line.indexOf(token);
        if (index >= 0) {
          //console.log('before', 'thresholdIndex', thresholdIndex, line);
          var first = index + token.length;

          var last = line.substring(first).indexOf(')');
          var args = line.substring(first).substring(0, last).split(",");
          //console.log('args', args);

          args[arg] = this.getEditThreshold(thresholdIndex);
          vue._data.thresholds[thresholdIndex].max = 255;
          vue._data.thresholds[thresholdIndex].step = 1;
          ++thresholdIndex;

          line = line.substring(0, first) + args.join(",") + line.substring(first+last);

          //console.log('after', 'thresholdIndex', thresholdIndex, line);
          lines[i] = line;
        }
      } catch (err) {
        console.error('thresholdIndex', thresholdIndex, err);
      }
      return thresholdIndex;
    },

    modifyEditThresholdF(lines, i, thresholdIndex, token, arg) {
      var line = lines[i];

      try {
        var index = line.indexOf(token);
        if (index >= 0) {
          //console.log('before', 'thresholdIndex', thresholdIndex, line);
          var first = index + token.length;

          var last = line.substring(first).indexOf(')');
          var args = line.substring(first).substring(0, last).split(",");
          //console.log('args', args);

          args[arg] = this.getEditThreshold(thresholdIndex);
          vue._data.thresholds[thresholdIndex].max = 1;
          vue._data.thresholds[thresholdIndex].step = 0.1;
          ++thresholdIndex;

          line = line.substring(0, first) + args.join(",") + line.substring(first+last);

          //console.log('after', 'thresholdIndex', thresholdIndex, line);
          lines[i] = line;
        }
      } catch (err) {
        console.error('thresholdIndex', thresholdIndex, err);
      }
      return thresholdIndex;
    },

    modifyEditColor(lines, i, colorIndex, token, arg) {
      var line = lines[i];

      try {
        var index = line.indexOf(token);
        if (index >= 0) {
          //console.log('before', 'colorIndex', colorIndex, line);
          var first = index + token.length;

          var last = line.substring(first).indexOf(')');
          var args = line.substring(first).substring(0, last).split(",");
          //console.log('args', args);

          var editColor = this.getEditColor(colorIndex);
          var newColor = getRGBValuesFromString(editColor);
          var parts = newColor.split(",");
          args[arg] = parts[0];
          args[arg+1] = parts[1];
          args[arg+2] = parts[2];
          ++colorIndex;

          line = line.substring(0, first) + args.join(",") + line.substring(first+last);

          //console.log('after', 'colorIndex', colorIndex, line);
          lines[i] = line;
        }
      } catch (err) {
        console.error('colorIndex', colorIndex, err);
      }
      return colorIndex;
    },

    onTextChange(text) {
      //console.log('onTextChange', text);
      var editText = vue._data.editText;
      editButton.onclick = eval(editButton.id + " = " + editText);
      ChromaAnimation.closeAnimation(editCanvas.id);
      var first = editText.indexOf('{');
      var last = editText.lastIndexOf('}') + 1;
      var code = editText.substring(first, last);
      eval(code);
    },

    onLayerChange(option) {
      //console.log(option);

      var refThis = this;
      setTimeout(function() {
        var layerIndex = 0;

        var editText = vue._data.editText;
        var lines = editText.toString().split(/\n/);
        for (var i = 0; i < lines.length; ++i) {
          layerIndex = refThis.modifyEditLayer(lines, i, layerIndex, 'var baseLayer');
          layerIndex = refThis.modifyEditLayer(lines, i, layerIndex, 'var layer');
        }
        editText = lines.join("\n");
        vue._data.editText = editText;
        editButton.onclick = eval(editButton.id + " = " + editText);
        ChromaAnimation.closeAnimation(editCanvas.id);
        var first = editText.indexOf('{');
        var last = editText.lastIndexOf('}') + 1;
        var code = editText.substring(first, last);
        eval(code);
      }, 100);
    },

    onColorChange(color) {

      var colorIndex = 0;

      //console.log('color-change', color, this, self);
      var editText = vue._data.editText;
      var lines = editText.toString().split(/\n/);
      for (var i = 0; i < lines.length; ++i) {
        colorIndex = this.modifyEditColor(lines, i, colorIndex, 'ChromaAnimation.getRGB(', 0);
        colorIndex = this.modifyEditColor(lines, i, colorIndex, 'ChromaAnimation.makeBlankFramesRGB(', 3);
        colorIndex = this.modifyEditColor(lines, i, colorIndex, 'ChromaAnimation.multiplyIntensityAllFramesRGB(', 1);
        colorIndex = this.modifyEditColor(lines, i, colorIndex, 'ChromaAnimation.fillThresholdColorsAllFramesRGB(', 2);
        colorIndex = this.modifyEditColor(lines, i, colorIndex, 'ChromaAnimation.fillThresholdColorsMinMaxAllFramesRGB(', 2); //first
        colorIndex = this.modifyEditColor(lines, i, colorIndex, 'ChromaAnimation.fillThresholdColorsMinMaxAllFramesRGB(', 6); //second
        colorIndex = this.modifyEditColor(lines, i, colorIndex, 'ChromaAnimation.fillNonZeroColorAllFramesRGB(', 1);
        colorIndex = this.modifyEditColor(lines, i, colorIndex, 'ChromaAnimation.fillZeroColorAllFramesRGB(', 1);
      }
      editText = lines.join("\n");
      vue._data.editText = editText;
      editButton.onclick = eval(editButton.id + " = " + editText);
      ChromaAnimation.closeAnimation(editCanvas.id);
      var first = editText.indexOf('{');
      var last = editText.lastIndexOf('}') + 1;
      var code = editText.substring(first, last);
      eval(code);
    },

    onThresholdChange(threshold) {

      var thresholdIndex = 0;

      //console.log('color-change', color, this, self);
      var editText = vue._data.editText;
      var lines = editText.toString().split(/\n/);
      for (var i = 0; i < lines.length; ++i) {
        thresholdIndex = this.modifyEditThreshold(lines, i, thresholdIndex, 'ChromaAnimation.fillThresholdColorsAllFramesRGB(', 1);
        thresholdIndex = this.modifyEditThreshold(lines, i, thresholdIndex, 'ChromaAnimation.fillThresholdColorsMinMaxAllFramesRGB(', 1); //first
        thresholdIndex = this.modifyEditThreshold(lines, i, thresholdIndex, 'ChromaAnimation.fillThresholdColorsMinMaxAllFramesRGB(', 5); //second
        thresholdIndex = this.modifyEditThresholdF(lines, i, thresholdIndex, 'ChromaAnimation.multiplyIntensityAllFrames(', 1);
      }
      editText = lines.join("\n");
      vue._data.editText = editText;
      editButton.onclick = eval(editButton.id + " = " + editText);
      ChromaAnimation.closeAnimation(editCanvas.id);
      var first = editText.indexOf('{');
      var last = editText.lastIndexOf('}') + 1;
      var code = editText.substring(first, last);
      eval(code);
    }


  }
});

//common animations

var animations = [];
animations.push('Blank_Keyboard.chroma');
animations.push('Blank2_Keyboard.chroma');
animations.push('Search1_Keyboard.chroma');
animations.push('Search2_Keyboard.chroma');
animations.push('Search3_Keyboard.chroma');
animations.push('Search4_Keyboard.chroma');
animations.push('BarrelFlash1_Keyboard.chroma');
animations.push('BarrelFlash2_Keyboard.chroma');
animations.push('BarrelFlash3_Keyboard.chroma');
animations.push('Clouds1_Keyboard.chroma');
animations.push('Clouds2_Keyboard.chroma');
animations.push('Clouds3_Keyboard.chroma');
animations.push('Arc1_Keyboard.chroma');
animations.push('Arc2_Keyboard.chroma');
animations.push('Arc3_Keyboard.chroma');
animations.push('Arc4_Keyboard.chroma');
animations.push('Block1_Keyboard.chroma');
animations.push('Block2_Keyboard.chroma');
animations.push('Bolt1_Keyboard.chroma');
animations.push('Bolt2_Keyboard.chroma');
animations.push('Bolt3_Keyboard.chroma');
animations.push('Bolt4_Keyboard.chroma');
animations.push('Dragon1_Keyboard.chroma');
animations.push('Dragon2_Keyboard.chroma');
animations.push('Dragon3_Keyboard.chroma');
animations.push('Claws1_Keyboard.chroma');
animations.push('Energy1_Keyboard.chroma');
animations.push('Fireball1_Keyboard.chroma');
animations.push('Fork1_Keyboard.chroma');
animations.push('Fork2_Keyboard.chroma');
animations.push('Fork3_Keyboard.chroma');
animations.push('Fork4_Keyboard.chroma');
animations.push('Fork5_Keyboard.chroma');
animations.push('FreeFall1_Keyboard.chroma');
animations.push('FreeFall2_Keyboard.chroma');
animations.push('Glider1_Keyboard.chroma');
animations.push('Glider2_Keyboard.chroma');
animations.push('LaserRotate_Keyboard.chroma');
animations.push('LaserScroll_Keyboard.chroma');
animations.push('Lightning1_Keyboard.chroma');
animations.push('Lightning2_Keyboard.chroma');
animations.push('Lightning3_Keyboard.chroma');
animations.push('CircleExpanding_Keyboard.chroma');
animations.push('Hatchet_Keyboard.chroma');
animations.push('Missile1_Keyboard.chroma');
animations.push('Missile2_Keyboard.chroma');
animations.push('Missile3_Keyboard.chroma');
animations.push('MovementUpLeft_Keyboard.chroma');
animations.push('MovementUpRight_Keyboard.chroma');
animations.push('Particle1_Keyboard.chroma');
animations.push('Particle2_Keyboard.chroma');
animations.push('Particle3_Keyboard.chroma');
animations.push('ParticleTrail1_Keyboard.chroma');
animations.push('ParticleTrail2_Keyboard.chroma');
animations.push('ParticleTrail3_Keyboard.chroma');
animations.push('ParticleTrail4_Keyboard.chroma');
animations.push('Projectiles_Keyboard.chroma');
animations.push('Rain1_Keyboard.chroma');
animations.push('Melee1_Keyboard.chroma');
animations.push('Ray1_Keyboard.chroma');
animations.push('Ray2_Keyboard.chroma');
animations.push('ReactiveSpace_Keyboard.chroma');
animations.push('Reticle1_Keyboard.chroma');
animations.push('Reticle2_Keyboard.chroma');
animations.push('Reticle3_Keyboard.chroma');
animations.push('Reticle4_Keyboard.chroma');
animations.push('Spiral_Keyboard.chroma');
animations.push('Spray1_Keyboard.chroma');
animations.push('Spray2_Keyboard.chroma');
animations.push('Spray3_Keyboard.chroma');
animations.push('Star_Keyboard.chroma');
animations.push('Stripes1_Keyboard.chroma');
animations.push('ThrowUpLeft_Keyboard.chroma');
animations.push('ThrowUpRight_Keyboard.chroma');
animations.push('ThrowUp_Keyboard.chroma');
animations.push('Tongue1_Keyboard.chroma');
animations.push('Tornado1_Keyboard.chroma');
animations.push('Trail1_Keyboard.chroma');
animations.push('Trail2_Keyboard.chroma');
animations.push('Trail3_Keyboard.chroma');
animations.push('Travel1_Keyboard.chroma');
animations.push('UpParticle1_Keyboard.chroma');
animations.push('UpParticle2_Keyboard.chroma');
animations.push('UpParticle3_Keyboard.chroma');
animations.push('Wisp1_Keyboard.chroma');
animations.push('Wisp2_Keyboard.chroma');
animations.push('Wisp3_Keyboard.chroma');
animations.push('X1_Keyboard.chroma');
animations.push('X2_Keyboard.chroma');
animations.push('WindMill1_Keyboard.chroma');
animations.push('MachineGun1_Keyboard.chroma');
animations.push('MachineGun2_Keyboard.chroma');
animations.push('SearchLight1_Keyboard.chroma');
animations.push('Logo1_Keyboard.chroma');
animations.push('Logo2_Keyboard.chroma');
animations.push('RocketProjectile1_Keyboard.chroma');
animations.push('Chainsaw1_Keyboard.chroma');
animations.push('WispLarge_Keyboard.chroma');
animations.push('BattleBus_Keyboard.chroma');
animations.push('BlackAndWhiteRainbow_Keyboard.chroma');
animations.push('BarRightToLeft_Keyboard.chroma');
animations.push('BarTopDown_Keyboard.chroma');
animations.push('OpenDoor1_Keyboard.chroma');
animations.push('OpenDoor2_Keyboard.chroma');
animations.push('Sword1_Keyboard.chroma');
animations.push('Block3_Keyboard.chroma');
animations.push('Block4_Keyboard.chroma');
animations.push('Arrow1_Keyboard.chroma');
animations.push('Train1_Keyboard.chroma');
animations.push('Train2_Keyboard.chroma');
animations.push('Ladder1_Keyboard.chroma');
animations.push('Ladder2_Keyboard.chroma');
animations.push('Chest1_Keyboard.chroma');
animations.push('Bird1_Keyboard.chroma');
animations.push('OutParticle1_Keyboard.chroma');
animations.push('Cinematic1_Keyboard.chroma');
animations.push('Cinematic2_Keyboard.chroma');
animations.push('Cinematic3_Keyboard.chroma');
animations.push('CircleLargeLeft_Keyboard.chroma');
animations.push('CircleLargeRight_Keyboard.chroma');
animations.push('CircleLarge_Keyboard.chroma');
animations.push('CircleLarge2_Keyboard.chroma');
animations.push('CircleSmallLeft_Keyboard.chroma');
animations.push('CircleSmallRight_Keyboard.chroma');
animations.push('CircleSmall_Keyboard.chroma');
animations.push('LaserA_Keyboard.chroma');
animations.push('LaserB_Keyboard.chroma');
animations.push('Llama1_Keyboard.chroma');
animations.push('Llama2_Keyboard.chroma');
animations.push('Llama3_Keyboard.chroma');
animations.push('Llama4_Keyboard.chroma');
animations.push('Ring1_Keyboard.chroma');
animations.push('Ring2_Keyboard.chroma');
animations.push('Ring3_Keyboard.chroma');
animations.push('WispBuild_Keyboard.chroma');
animations.push('XOutline_Keyboard.chroma');
animations.push('X_Keyboard.chroma');
animations.push('Bow1_Keyboard.chroma');
animations.push('Heart1_Keyboard.chroma');
animations.push('Damage1_Keyboard.chroma');
animations.push('Damage2_Keyboard.chroma');
animations.push('Damage3_Keyboard.chroma');
animations.push('Damage4_Keyboard.chroma');
animations.push('Damage5_Keyboard.chroma');
animations.push('Damage6_Keyboard.chroma');
animations.push('Damage7_Keyboard.chroma');
animations.push('Damage8_Keyboard.chroma');
var layerOptions = [];
for (var i in animations) {
  var animation = animations[i];
  layerOptions.push({ label: animation, value: '../ChromaCommon/animations/'+animation });
  vue._data.layerOptions = layerOptions;
}

parseEditColor = function(line, token, arg) {
  var index = line.indexOf(token);
  if (index >= 0) {
    var first = index + token.length;
    for (var j = first; j < line.length; ++j) {
      //extract rgb
      if (line[j] == ')') {
        var rgb = line.substring(first, j);
        var parts = rgb.split(",");
        var red = vue.convertIntToHex(parseInt(parts[arg].trim()));
        var green = vue.convertIntToHex(parseInt(parts[arg+1].trim()));
        var blue = vue.convertIntToHex(parseInt(parts[arg+2].trim()));
        var editColor = "#" + red + green + blue;
        vue._data.colors.push({ color: editColor });
        break;
      }
    }
  }
}
parseEditThreshold = function(line, token, arg) {
  var index = line.indexOf(token);
  if (index >= 0) {
    var first = index + token.length;
    for (var j = first; j < line.length; ++j) {
      //extract rgb
      if (line[j] == ')') {
        var args = line.substring(first, j);
        var parts = args.split(",");
        var threshold = parseInt(parts[arg].trim());
        vue._data.thresholds.push({ threshold: threshold, max: 255, step: 1 });
        break;
      }
    }
  }
}
parseEditThresholdF = function(line, token, arg) {
  var index = line.indexOf(token);
  if (index >= 0) {
    var first = index + token.length;
    for (var j = first; j < line.length; ++j) {
      //extract rgb
      if (line[j] == ')') {
        var args = line.substring(first, j);
        var parts = args.split(",");
        var threshold = parseFloat(parts[arg].trim());
        vue._data.thresholds.push({ threshold: threshold, max: 1, step: 0.1 });
        break;
      }
    }
  }
}
parseEditLayer = function(line, token, arg) {
  var index = line.indexOf(token);
  if (index >= 0) {
    var first = index + token.length;
    var start = undefined;
    for (var j = first; j < line.length; ++j) {
      //extract rgb
      if (line[j] == '"' || line[j] == "'") {
        if (start == undefined) {
          start = j+1;
        } else {
          var path = line.substring(start).substring(0, j-start);
          //console.log('path', path);
          vue._data.layers.push({ label: path.substring(path.lastIndexOf('/')), value: path });
        }
      }
    }
  }
}
displayEditComponents = function() {

  // show RGB colors

  // reset data
  vue._data.layers = [];
  vue._data.colors = [];
  vue._data.thresholds = [];

  var lines = vue._data.editText.toString().split(/\n/);
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    //console.log(line);

    parseEditLayer(line, 'var baseLayer');
    parseEditLayer(line, 'var layer');

    parseEditColor(line, 'ChromaAnimation.getRGB(', 0);
    parseEditColor(line, 'ChromaAnimation.makeBlankFramesRGB(', 3);
    parseEditColor(line, 'ChromaAnimation.multiplyIntensityAllFramesRGB(', 1);
    parseEditColor(line, 'ChromaAnimation.fillThresholdColorsAllFramesRGB(', 2);
    parseEditColor(line, 'ChromaAnimation.fillThresholdColorsMinMaxAllFramesRGB(', 2); //first
    parseEditColor(line, 'ChromaAnimation.fillThresholdColorsMinMaxAllFramesRGB(', 6); //second
    parseEditColor(line, 'ChromaAnimation.fillNonZeroColorAllFramesRGB(', 1);
    parseEditColor(line, 'ChromaAnimation.fillZeroColorAllFramesRGB(', 1);

    parseEditThreshold(line, 'ChromaAnimation.fillThresholdColorsAllFramesRGB(', 1);
    parseEditThreshold(line, 'ChromaAnimation.fillThresholdColorsMinMaxAllFramesRGB(', 1); //second
    parseEditThreshold(line, 'ChromaAnimation.fillThresholdColorsMinMaxAllFramesRGB(', 5); //second
    parseEditThresholdF(line, 'ChromaAnimation.multiplyIntensityAllFrames(', 1);
  }
}
setupLiveEditOnClick = function(canvas) {
  canvas.addEventListener('mouseover', function() {
    var buttonName = 's'+this.id.substring('canvasKeyboardS'.length);
    this.onclick = function() {
      editButton = document.getElementById(buttonName);
      if (editButton == undefined) {
        console.error(buttonName, 'could not be found!');
      }
      editCanvas = this;
      var panel = document.getElementById('editPanel');
      var editText = editButton.onclick.toString();
      if (panel.style.display == "none" ||
        vue._data.editText != editText) {
        panel.style.display = "";
        var top = document.documentElement.scrollTop || document.body.scrollTop;
        var left = document.documentElement.scrollLeft || document.body.scrollLeft + editButton.getBoundingClientRect().x;
        panel.style.left = left + 715;
        panel.style.top = top + editButton.getBoundingClientRect().y - 100;
        panel.style.width = 1500;
        panel.style.height = 910;
        vue._data.editText = editText;

        displayEditComponents();

      } else {
        panel.style.display = "none";
      }
    }
  }, false);
}
