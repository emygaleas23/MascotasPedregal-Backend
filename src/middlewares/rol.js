export const esAdmin = (req, res, next) =>{
    if (req.usuario.rol !== "ADMINISTRADOR"){
        return res.status(403).json({
            msg:" Acceso denegado: se requieren permisos de administrador"
        });
    }
    next();
}
