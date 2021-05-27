exports.crearPDF = function(asistente,callback){
    if(asistente){
        var pdf = require('pdfkit');
        var fs = require('fs');
        var longNombre = 20;

        if(asistente.nombre.length >= 25){
            longNombre = 18;
        }

        var doc = new pdf({
            margin : 0
        });

        writeStream = fs.createWriteStream('./views/public/pdf/' + asistente.cedula + '.pdf');
        doc.pipe(writeStream);

        doc.registerFont('Sebino', 'fuentes/Sebino-Light.ttf')
        doc.registerFont('Adagio', 'fuentes/adagio-sans.ttf')

        //Titulos
        doc.font('Adagio');
        doc.fontSize(16)
            .text('PASAJERO',175,74)
            .text('PASAJERO',175,74)
            .text('PASAJERO',175,74);

        doc.fontSize(13)
            .text('Identificación',175,134)
            .text('Identificación',175,134)
            .text('Identificación',175,134);

        doc.fontSize(13)
            .text(asistente.alojamiento,175,182)
            .text(asistente.alojamiento,175,182)
            .text(asistente.alojamiento,175,182);

        //Info
        doc.font('Sebino');


        //nombre edicion
        doc.fontSize(longNombre);

        while(doc.widthOfString(asistente.nombre)>=266){
            longNombre--;
            doc.fontSize(longNombre);
        }

        doc.text(asistente.nombre,175,104);

        //cedula

        doc.fontSize(16)
            .text(asistente.cedula,175,152);

        doc.fontSize(16)
            .text(asistente.habitacion,175,200);

        //doc.rect(163.5, 67, 288, 185).stroke();
        doc.end();

        writeStream.on('finish', function () {
            callback(asistente.cedula);
            writeStream.end();
        });
    }


}
