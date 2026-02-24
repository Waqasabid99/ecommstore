const requireAdmin = (req, res, next) => {
  const role = req.user?.role.toUpperCase();
  console.log(role)
  if (role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden - Admin access required' })
  }
  next()
}

export { requireAdmin };