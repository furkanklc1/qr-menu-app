import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('🔌 Socket Kapısı Açıldı!');
  }

  handleConnection(client: Socket) {

    console.log(`Biri bağlandı: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Biri ayrıldı: ${client.id}`);
  }
}