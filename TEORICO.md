# 1 Persistir información en frontend
### Una de las formas mas efectivas para persistir datos en el frontend es utilizar una memoria caché, ya que almacena los datos recuperados o procesados anteriormente y permite reutilizarlos de forma eficaz, sin tener que acceder a los datos desde la ubicación principal que es mas lenta. Los datos se almacenan en un hardware de acceso rápido (como la RAM), de forma transitoria y como un subconjunto de datos, a diferencia de una base de datos, donde los elementos se almacenan completos y de forma duradera.

# 2 Debug rutas
### Las herramientas que suelo utilizar para encontrar este tipo de erorres suelen ser la consola del navegador, network (devtools), y depurador de JavaScript (debugger).

### La consola permite ver errores de javascript que pueden ser la causa de que una página quede en blanco.

### La pestaña Network de devtools en navegadores permite verificar errores en las solicitudes, o si algún recurso no se carga correctamente.

### El depurador de JavaScript permite establecer puntos de interrupción en el código y examinar su ejecución, para identificar dónde se produce el problema.


# 3 Caso imágenes
### Para evitar perder la información que el usuario intenta enviar por problemas de conexión, se podría almacenar temporalmente en caché o algún tipo de almacenamiento local, y permitirle al usuario continuar desde el punto donde quedó en lugar de comenzar de cero. También se podrían programar reintentos de envío automáticos con un temporizador, para que si mejora la conexión, intente enviar los datos nuevamente hasta completar la carga.

### En el caso de las imágenes se puede realizar una compresíon de las mismas en el lado del cliente y en el servidor. Algunas de las formas de compresión permiten reducir el tamaño de la imágen sin perder prácticamente calidad. Una de las formas sería redimensionar con blob y canvas desde el cliente, y otra convertir a formato WEBP en el servidor. Otro enfoque compatible con los anteriores, sería la carga de imágenes por lotes, evitando enviar peticiones muy grandes.