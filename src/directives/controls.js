angular.module('leaflet-directive').directive('lfControls', function(leafletLogger, leafletHelpers, leafletControlHelpers) {

  return {
    restrict: 'A',
    scope: false,
    replace: false,
    require: '?^leaflet',

    link: function(scope, element, attrs, controller) {
      if (!controller) {
        return;
      }

      var createControl = leafletControlHelpers.createControl;
      var isValidControlType = leafletControlHelpers.isValidControlType;
      var leafletScope  = controller.getLeafletScope();
      var isDefined = leafletHelpers.isDefined;
      var isArray = leafletHelpers.isArray;
      var leafletControls = {};

      controller.getMap().then(function(map) {

        leafletScope.$watchCollection('controls', function(newControls) {

          // Delete controls from the array
          for (var name in leafletControls) {
            if (!isDefined(newControls[name])) {
              if (map.hasControl(leafletControls[name])) {
                map.removeControl(leafletControls[name]);
              }

              delete leafletControls[name];
            }
          }

          for (var newName in newControls) {
            var control;

            var controlType = isDefined(newControls[newName].type) ? newControls[newName].type : newName;

            if (!isValidControlType(controlType)) {
              leafletLogger.error(' Invalid control type: ' + controlType, 'controls');
              return;
            }

            if (controlType !== 'custom') {
              control = createControl(controlType, newControls[newName]);
              map.addControl(control);
              leafletControls[newName] = control;
            } else {
              var customControlValue = newControls[newName];
              if (isArray(customControlValue)) {
                for (var i in customControlValue) {
                  var customControl = customControlValue[i];
                  map.addControl(customControl);
                  leafletControls[newName] = !isDefined(leafletControls[newName]) ? [customControl] : leafletControls[newName].concat([customControl]);
                }
              } else {
                map.addControl(customControlValue);
                leafletControls[newName] = customControlValue;
              }
            }
          }

        });

      });
    },
  };
});
