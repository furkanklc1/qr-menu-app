import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    // Statik '*' yerine dinamik origin kontrolü
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!requestOrigin) {
        return callback(null, true);
      }
      
      // İzin verilen domainler listesi
      const allowedOrigins = [
        'http://localhost:3000', 
        'http://localhost:3001',
        process.env.FRONTEND_URL // Canlıdaki domain
      ];

      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
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