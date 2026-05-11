# socket-server/server.py
import socketio
import eventlet
from eventlet import wsgi

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)


@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')
    sio.emit('connected', {'status': 'ok'}, room=sid)


@sio.event
def admin_join(sid, data):
    print(f'Admin joined: {sid}')
    sio.save_session(sid, {'role': 'admin'})


@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')

# HTTP endpoint to receive notifications from Django


def handle_notification(environ, start_response):
    if environ['REQUEST_METHOD'] == 'POST':
        try:
            body = environ['wsgi.input'].read()
            data = json.loads(body)
            event = data.get('event')
            notification_data = data.get('data')

            if event == 'new_order':
                sio.emit('new_order', notification_data)
                sio.emit('notification', {
                    'title': '🛒 New Order!',
                    'message': f"Order #{notification_data['order_id']} - ₹{notification_data['total']}",
                    'data': notification_data
                })
                print(f"✅ Broadcast new order: {notification_data}")

            start_response('200 OK', [('Content-Type', 'application/json')])
            return [b'{"status": "sent"}']
        except Exception as e:
            print(f"Error: {e}")
            start_response('500 Internal Error', [
                           ('Content-Type', 'application/json')])
            return [b'{"error": "failed"}']

    start_response('404 Not Found', [('Content-Type', 'application/json')])
    return [b'{"error": "not found"}']


# Mount the HTTP handler
app = socketio.WSGIApp(sio, {
    '/emit': handle_notification
})

if __name__ == '__main__':
    print("🚀 Socket.IO server on http://localhost:5000")
    wsgi.server(eventlet.listen(('0.0.0.0', 5000)), app)
