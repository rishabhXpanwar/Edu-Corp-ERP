
### shared/socket-events.md
(Full content — save verbatim to shared/socket-events.md)

# shared/socket-events.md
# TYPE: EXECUTION FILE — FOR CODING AGENT

## Connection
Server: io = new Server(httpServer, { cors:{origin:CLIENT_URL,credentials:true} })
  io.use(socketAuthMiddleware) → io.on('connection', socket => socket.join(`user:${socket.userId}`))
Client: io(SOCKET_URL, { auth:{token:localStorage.getItem(ACCESS_TOKEN_KEY)}, reconnectionAttempts:5 })
  Mounted ONCE in AuthLayout.jsx. Torn down on logout. NOT in Redux.

## Namespace: / (default, single, v1)

## Rooms
user:<userId> — everyone joins on connect (personal notifications)
class:<classId> — teachers + students join their class room

## CLIENT → SERVER: none in v1

## SERVER → CLIENT

notification:new
  Emitted by: notificationService.js after POST /notifications DB write
  Room: user:<recipientId> OR class:<classId>
  Payload: { notificationId, message, senderId, senderName, type:'individual'|'section'|'class', createdAt }
  Frontend: dispatch(addNotification(payload)) + dispatch(incrementUnreadCount()) + toast.success(...)

## Socket Auth Middleware
socket.handshake.auth.token → tokenHelpers.verifyToken → attach socket.userId/role/schoolId

## Disconnect Handling
connect_error → console.log, no redirect
disconnect 'io server disconnect' → dispatch(clearAuth()) → window.location='/login'
all other reasons → socket auto-reconnects (up to 5 attempts)
