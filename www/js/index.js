var pos, errors = -1, x, user = new Object(), img, map, markers = new Array(), network = false, db;
function initMap(){
    map = new google.maps.Map(document.getElementById('map_canvas'),{
        center: {lat: -33.435360, lng: -70.614737}, 
        zoom: 15,
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            markers.push(
                new google.maps.Marker({
                    position: {lat: position.coords.latitude, lng: position.coords.longitude},
                    map: map,
                    animation: google.maps.Animation.DROP,
                })
            );
            if (position.coords.latitude) {
                pos = "lat:"+position.coords.latitude+", lng: "+position.coords.longitude;
            } else {
                pos = "lat: -33.435360, lng: -70.614737";
            }
            map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
        }, function(error){
            alert(error);
        }, {enableHighAccuracy: true});
    }

    // markers.push(new google.maps.Marker({
    //     map: map,
    //     title: 'Tu sede',
    //     position: {lat: lat, lng: lng}
    // }));
    // map.setCenter({lat: lat, lng: lng});
}

document.addEventListener('deviceready', function(){
    $(document).ready(function(){
        $(window).on('load', function(){
            checkNetwork();
            initMap();
            
            $('#submit').click(function(){
                if (errors < 1) {
                    obtenerDatos();
                    console.log(user);
                    if(network){
                        $.ajax({
                            type: 'POST',
                            url: 'http://72.14.183.67/ws/s2/perfil.php',
                            data: {
                                foto: user['img'],
                                nombres: user['firstName'],
                                apellidos: user['lastName'],
                                rut: user['run'],
                                edad: user['age'],
                                sexo: user['sexo'],
                                email: user['email'],
                                fono: user['fono'],
                                carrera: user['carrera'],
                                coordenadas: user['coordenadas'],
                                fecha_creacion: user['fecha_creacion']
                            },
                            success: function(response){
                                alert("PERFIL CREADO");
                                $.ajax({
                                    type: 'POST',
                                    url: 'http://72.14.183.67/ws/s2/qr.php',
                                    data: {
                                        user: user['run'],
                                        qr: 'http://72.14.183.67/ws/s2/archivos/'+user['run']+'.html'
                                    },
                                    success: function(response){
                                        alert("QR CREADO!");
                                    },
                                    error: function(){
                                        console.log(error);
                                    }
                                });
                            }, 
                            error: function(error, response){
                                console.log(response);
                            }
                        });
                    } else {
                        insertBdd();
                    }
                } else {
                    console.log("errors");
                }
            });
            $('#imgPersonal').click(function(){
                if (navigator.camera) {
                    navigator.camera.getPicture(function(imageURI){
                        img = 'data:image/jpeg;base64,' + imageURI;
                        document.getElementById('imgPersonal').src = 'data:image/jpeg;base64,' + imageURI;
                    }, function(error){
                        clearCache();
                        navigator.notification.alert('Captura descartada', 'Tome otra, por favor.');
                    },{ quality: 50, destinationType: Camera.DestinationType.DATA_URL});
                }
            });
            checkNetwork();
        });
    });
}, false);

$('#name').blur(function(){
    errors === -1 ? errors+=2 : '';
    errors--;
    if (!validateInput($(this).val(), 'firstName')) {
        $(this).addClass('error');
        errors++;
    } else {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
        }
    }
});
$('#lastName').blur(function(){
    errors === -1 ? errors+=2 : '';
    errors--;
    if (!validateInput($(this).val(), 'firstName')) {
        $(this).addClass('error');
        errors++;
    } else {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
        }
    }
});
$('#run').blur(function(){
    errors === -1 ? errors+=2 : '';
    errors--;
    if (!validateInput($(this).val(), 'RUN')) {
        $(this).addClass('error');
        errors++;
    } else {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
        }
    }
});

$('#age').blur(function(){
    errors === -1 ? errors+=2 : '';
    errors--;
    if (!validateInput($(this).val(), 'age')) {
        $(this).addClass('error');
        errors++;
    } else {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
        }
    }
});

$('#email').blur(function(){
    errors === -1 ? errors+=2 : '';
    errors--;
    if (!validateInput($(this).val(), 'email')) {
        $(this).addClass('error');
        errors++;
    } else {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
        }
    }
});

$('#fono').blur(function(){
    errors === -1 ? errors+=2 : '';
    errors--;
    if (!validateInput($(this).val(), 'fono')) {
        $(this).addClass('error');
        errors++;
    } else {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
        }
    }
});

$('#carrera').blur(function(){
    errors === -1 ? errors+=2 : '';
    errors--;
    if (!validateInput($(this).val(), 'carrera')) {
        $(this).addClass('error');
        errors++;
    } else {
        if ($(this).hasClass('error')) {
            $(this).removeClass('error');
        }
    }
});


  
  function validateInput(value, typeOf) {
    var result;
    var toValidate = value;
    switch (typeOf) {
      case 'firstName':
        // let pattern = new RegExp();
        result = /^[^0-9]+$/.test(toValidate);
        return result;
        break;
        case 'lastName':
        // let pattern = new RegExp(/^[^0-9]+$/)
        result = /^[^0-9]+$/.test(toValidate);
        return result;
        break;
      case 'RUN':
        toValidate = value.replace('.', '');
        var final = toValidate.replace('-', '');
        var cuerpo = final.slice(0, -1);
        var dv = final.slice(-1).toUpperCase();
        toValidate = cuerpo + '-' + dv;
        if (cuerpo.length < 7) {
          return false;
        }
        suma = 0;
        multiplo = 2;
        for(i=1;i<=cuerpo.length;i++) {
          index = multiplo * final.charAt(cuerpo.length - i);
          suma = suma + index;
          if(multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
        }
        dvEsperado = 11 - (suma % 11);
        dv = (dv == 'K')?10:dv;
        dv = (dv == 0)?11:dv;
  
        if(dvEsperado != dv) return false;
        return true;
        break;
    case 'age':
        if (toValidate >= 1 && toValidate <= 110) {
           return true; 
        } else {
            return false;
        }
        break;
    case 'email':
        // if(/[@]+$/.test(toValidate)) {
        //     return true;
        // } else {
        //     return false;
        // }
        return true;
        break;
    case 'fono':
        if (toValidate.length === 9 || toValidate.length === 12) {
            return true;
        } else {
            return false;
        }
        break;
    case 'carrera':
        // let pattern = new RegExp(/^[^0-9]+$/);
        result = /^[^0-9]+$/.test(toValidate);
        return result;
        break;
    }
  }
  function obtenerDatos() {
    user['firstName'] = $('#name').val();
    user['lastName'] = $('#lastName').val();
    let aux = $('#run').val();
    run = aux.replace('.', '');
    user['run'] = run.replace('-', '');
    user['age'] = $('#age').val();
    user['sexo'] = $('#sexo option:selected').val();
    user['email'] = $('#email').val();
    user['fono'] = $('#fono').val();
    user['carrera'] = $('#carrera').val();
    user['img'] = img;
    user['coordenadas'] = pos;
    user['fecha_creacion'] = new Date().getTime();
  }
function checkNetwork() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    console.log(networkState);
    if (networkState == Connection.NONE) { 
        db = sqlitePlugin.openDatabase('T2_S2.db', '1.0', '', 10*20);
            db.transaction(function (txn) {
                txn.executeSql('CREATE TABLE IF NOT EXISTS alumno (id_alumno integer primary key auto increment, foto, nombres, apellidos, edad, rut, sexo, email, fono, carrera, coordenadas, fecha_creacion)');
            });
        } else {
            network = true;
        }
}
function insertBdd(){
    db.transaction(function(txn){
        txn.executeSql('INSERT INTO alumno (foto, nombres, apellidos, edad, rut, sexo, email, fono, carrera, coordenadas, fecha_creacion) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[ user['img'], user['firstName'], user['lastName'], user['age'], user['sexo'], user['email'], user['fono'], user['carrera'], user['coords'], user['fecha_creacion'] ]);
    });
}