import { Server as SocketIOServer, Socket } from 'socket.io';

// Track active socket connections for drivers and passengers
export const activeDrivers = new Map<string, string>(); // driver_id -> socket_id
export const driverLocations = new Map<string, { latitude: number; longitude: number; heading?: number; updated_at: string }>();

/**
 * Configure Real-Time Socket.IO Driver Dispatch & Telemetry Engine
 * Directly implements user specification with gracefully resilient disconnects
 * and real-time bi-directional messaging.
 */
export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // 1. Driver joins online pool and registers their active socket
    socket.on('driver:online', ({ driver_id }: { driver_id: string }) => {
      if (!driver_id) return;
      activeDrivers.set(driver_id, socket.id);
      console.log(`[Socket.IO] Driver ${driver_id} is online (socket: ${socket.id})`);

      // Broadcast presence update
      io.emit('driver:status_change', {
        driver_id,
        is_online: true,
        total_active_drivers: activeDrivers.size,
        timestamp: new Date().toISOString()
      });
    });

    // Driver explicitly goes offline
    socket.on('driver:offline', ({ driver_id }: { driver_id: string }) => {
      if (!driver_id) return;
      activeDrivers.delete(driver_id);
      console.log(`[Socket.IO] Driver ${driver_id} went offline`);

      io.emit('driver:status_change', {
        driver_id,
        is_online: false,
        total_active_drivers: activeDrivers.size,
        timestamp: new Date().toISOString()
      });
    });

    // 2. Driver broadcasts continuous GPS location update
    socket.on(
      'driver:location_update',
      ({
        driver_id,
        latitude,
        longitude,
        heading = 0
      }: {
        driver_id: string;
        latitude: number;
        longitude: number;
        heading?: number;
      }) => {
        if (!driver_id || typeof latitude !== 'number' || typeof longitude !== 'number') return;

        const locationPayload = {
          driver_id,
          latitude,
          longitude,
          heading,
          timestamp: new Date().toISOString()
        };

        // Cache latest coordinates in memory
        driverLocations.set(driver_id, {
          latitude,
          longitude,
          heading,
          updated_at: locationPayload.timestamp
        });

        // Broadcast location update to nearby passengers or assigned ride channel
        socket.broadcast.emit(`driver:location:${driver_id}`, locationPayload);

        // Also emit to general fleet telemetry channel for admin heatmaps/dispatchers
        io.emit('driver:fleet_telemetry', locationPayload);
      }
    );

    // 3. Send instant ride request alert to a specific driver
    socket.on(
      'ride:request_dispatch',
      ({ driver_id, trip_data }: { driver_id: string; trip_data: any }) => {
        const driverSocketId = activeDrivers.get(driver_id);
        console.log(`[Socket.IO] Dispatching ride offer to driver ${driver_id} (socket: ${driverSocketId || 'OFFLINE'})`);

        if (driverSocketId) {
          io.to(driverSocketId).emit('ride:new_offer', {
            ...trip_data,
            dispatch_time: new Date().toISOString(),
            status: 'pending_driver_acceptance'
          });

          // Acknowledge dispatch to requester
          socket.emit('ride:dispatch_status', {
            driver_id,
            status: 'sent',
            driver_socket: driverSocketId
          });
        } else {
          // Inform requester that driver is no longer connected
          socket.emit('ride:dispatch_status', {
            driver_id,
            status: 'driver_unavailable',
            message: `Driver ${driver_id} is currently offline or unreachable.`
          });
        }
      }
    );

    // 4. Driver accepts or declines offer
    socket.on('ride:offer_response', ({ trip_id, driver_id, accepted }: { trip_id: string; driver_id: string; accepted: boolean }) => {
      console.log(`[Socket.IO] Driver ${driver_id} responded to offer ${trip_id}: ${accepted ? 'ACCEPTED' : 'DECLINED'}`);
      io.emit('ride:status_update', {
        trip_id,
        driver_id,
        status: accepted ? 'driver_accepted' : 'driver_declined',
        timestamp: new Date().toISOString()
      });
    });

    // 5. Handle connection drops gracefully
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      let disconnectedDriverId: string | null = null;

      for (const [driver_id, socket_id] of activeDrivers.entries()) {
        if (socket_id === socket.id) {
          activeDrivers.delete(driver_id);
          disconnectedDriverId = driver_id;
          break;
        }
      }

      if (disconnectedDriverId) {
        console.log(`[Socket.IO] Driver ${disconnectedDriverId} cleaned up from activeDrivers`);
        io.emit('driver:status_change', {
          driver_id: disconnectedDriverId,
          is_online: false,
          total_active_drivers: activeDrivers.size,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
}
