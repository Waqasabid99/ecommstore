import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { verifyToken } from '../constants/constants.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

const verifyUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken
    console.log('Access Token:', accessToken)
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    let payload
    try {
      payload = verifyToken(accessToken, JWT_SECRET)
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      })
    }

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    req.user = user
    next()

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export { verifyUser }