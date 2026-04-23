import jwt from "jsonwebtoken";
import Usuario from "../models/usuarios/Usuario.js";

const createToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const verifyToken = async (req, res, next) => {
    const {authorization} = req.headers;

    if (!authorization) return res.status(401).json({msg: "Acceso denegado: token no proporcionado"})
    
    try{
        const token = authorization.split(" ")[1]
        const { id, rol, email } = jwt.verify(token, process.env.JWT_SECRET)

        const usuario = await Usuario.findById(id).select("-password -token -createdAt -updatedAt -__v") // Buscar el usuario por ID y excluir campos sensibles
        if (!usuario) return res.status(401).json({msg: "Usuario no encontrado"})

        req.usuario = usuario // Guardar el usuario en la solicitud para usarlo en los controladores
        next()
        
    }catch (error){
        console.log(error)
        return res.status(401).json({msg: `Token invalido o expirado - ${error}`})
    }
}

export { createToken, verifyToken };