import { Router } from "express"; // export comun sin default

const route = Router();
 
route.get('/perfil', (req, res) => {
    res.render('perfil', {
        name: "Exequiel Dearmas",
        rol: "guest",
        isAdmin: true,
        notas: [{curso: "javascript", nota:10},{curso: 'html', nota:9}, {curso:'css', nota:6}, {curso:'react', nota: 3}]
    }) 
})

route.get('/socket', (req, res) => {
    res.render('chat',{})
})

route.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', {});
})

export default route;