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
        const {id} = jwt.verify(token, process.env.JWT_SECRET)

        const usuario = await Usuario.findById(id).select("-password -token -createdAt -updatedAt -__v") // Buscar el usuario por ID y excluir campos sensibles
        if (!usuario) return res.status(401).json({msg: "Usuario no encontrado"})

        // Validacion de estado
        if (usuario.estado === false){
          return res.status(403).json({msg:"Acceso denegado: Tu cuenta ha sido desactivada por un administrador."})
        }

        req.usuario = usuario // Guardar el usuario en la solicitud para usarlo en los controladores
        next()
        
    }catch (error){
        console.log(error)
        return res.status(401).json({msg: `Token invalido o expirado - ${error}`})
    }
}

export { createToken, verifyToken };