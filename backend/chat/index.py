import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для синхронизации данных чата между пользователями
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными чата
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        path = event.get('queryStringParameters', {}).get('path', '')
        
        if method == 'GET':
            if path == 'accounts':
                cur.execute('''
                    SELECT id, password, username, role, avatar, 
                           bg_color as "bgColor", 
                           created_at as "createdAt"
                    FROM accounts 
                    ORDER BY created_at
                ''')
                accounts = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(row) for row in accounts], default=str)
                }
            
            elif path == 'rooms':
                cur.execute('''
                    SELECT r.id, r.name, r.description, r.theme, r.badge, r.password,
                           r.max_participants as "maxParticipants",
                           r.current_participants as "currentParticipants",
                           r.is_adult as "is_adult",
                           r.is_locked as "is_locked", 
                           r.is_private as "is_private",
                           r.creator_id as "creatorId",
                           r.creator_username as "creatorUsername",
                           r.created_at as "createdAt",
                           COALESCE(array_agg(
                               json_build_object(
                                   'accountId', rp.account_id,
                                   'username', rp.username,
                                   'avatar', rp.avatar,
                                   'bgColor', rp.bg_color,
                                   'role', rp.role
                               )
                           ) FILTER (WHERE rp.account_id IS NOT NULL), '{}') as participants,
                           COALESCE(array_agg(
                               json_build_object(
                                   'userId', bu.user_id,
                                   'username', bu.username,
                                   'bannedBy', bu.banned_by,
                                   'bannedAt', bu.banned_at
                               )
                           ) FILTER (WHERE bu.user_id IS NOT NULL), '{}') as "bannedUsers",
                           COALESCE(array_agg(
                               json_build_object(
                                   'userId', mu.user_id,
                                   'username', mu.username,
                                   'mutedBy', mu.muted_by,
                                   'mutedAt', mu.muted_at
                               )
                           ) FILTER (WHERE mu.user_id IS NOT NULL), '{}') as "mutedUsers"
                    FROM rooms r
                    LEFT JOIN room_participants rp ON r.id = rp.room_id
                    LEFT JOIN banned_users bu ON r.id = bu.room_id
                    LEFT JOIN muted_users mu ON r.id = mu.room_id
                    GROUP BY r.id
                    ORDER BY r.created_at DESC
                ''')
                rooms = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(row) for row in rooms], default=str)
                }
            
            elif path == 'messages':
                room_id = event.get('queryStringParameters', {}).get('roomId', '')
                cur.execute('''
                    SELECT id, room_id as "roomId", user_id as "userId", 
                           username as "user", avatar, bg_color as "bgColor", 
                           text, image, reply_to as "replyTo", 
                           created_at as timestamp
                    FROM messages 
                    WHERE room_id = %s 
                    ORDER BY created_at ASC
                    LIMIT 100
                ''', (room_id,))
                messages = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(row) for row in messages], default=str)
                }
            
            elif path == 'complaints':
                cur.execute('DELETE FROM complaints WHERE expires_at < NOW()')
                conn.commit()
                
                cur.execute('SELECT * FROM complaints ORDER BY created_at DESC')
                complaints = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(row) for row in complaints], default=str)
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'auth':
                user_id = body.get('id')
                password = body.get('password')
                cur.execute('SELECT * FROM accounts WHERE id = %s AND password = %s', (user_id, password))
                account = cur.fetchone()
                if account:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'account': dict(account)}, default=str)
                    }
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False})
                }
            
            elif action == 'create_account':
                cur.execute('''
                    INSERT INTO accounts (id, password, username, role, avatar, bg_color)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING *
                ''', (body['id'], body['password'], body['username'], body['role'], body['avatar'], body['bgColor']))
                account = cur.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'account': dict(account)}, default=str)
                }
            
            elif action == 'create_room':
                cur.execute('''
                    INSERT INTO rooms (id, name, theme, description, creator_id, creator_username, 
                                     max_participants, is_adult, is_locked, is_private, password)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                ''', (body['id'], body['name'], body['theme'], body.get('description'), 
                      body['creatorId'], body['creatorUsername'], body['maxParticipants'],
                      body['isAdult'], body['isLocked'], body['isPrivate'], body.get('password')))
                room = cur.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'room': dict(room)}, default=str)
                }
            
            elif action == 'join_room':
                cur.execute('''
                    INSERT INTO room_participants (room_id, account_id, username, avatar, bg_color, role)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (room_id, account_id) DO NOTHING
                ''', (body['roomId'], body['accountId'], body['username'], body['avatar'], body['bgColor'], body.get('role', 'member')))
                
                cur.execute('UPDATE rooms SET current_participants = (SELECT COUNT(*) FROM room_participants WHERE room_id = %s) WHERE id = %s', (body['roomId'], body['roomId']))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'leave_room':
                cur.execute('DELETE FROM room_participants WHERE room_id = %s AND account_id = %s', (body['roomId'], body['accountId']))
                cur.execute('UPDATE rooms SET current_participants = (SELECT COUNT(*) FROM room_participants WHERE room_id = %s) WHERE id = %s', (body['roomId'], body['roomId']))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'send_message':
                cur.execute('''
                    INSERT INTO messages (id, room_id, user_id, username, avatar, bg_color, text, image, reply_to, is_system_message)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                ''', (body['id'], body['roomId'], body.get('userId'), body.get('username'), 
                      body.get('avatar'), body.get('bgColor'), body['text'], body.get('image'), 
                      body.get('replyTo'), body.get('isSystemMessage', False)))
                message = cur.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': dict(message)}, default=str)
                }
            
            elif action == 'ban_user':
                cur.execute('''
                    INSERT INTO banned_users (room_id, user_id, username, banned_by)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (room_id, user_id) DO NOTHING
                ''', (body['roomId'], body['userId'], body['username'], body['bannedBy']))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'unban_user':
                cur.execute('DELETE FROM banned_users WHERE room_id = %s AND user_id = %s', (body['roomId'], body['userId']))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'mute_user':
                cur.execute('''
                    INSERT INTO muted_users (room_id, user_id, username, muted_by)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (room_id, user_id) DO NOTHING
                ''', (body['roomId'], body['userId'], body['username'], body['mutedBy']))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'unmute_user':
                cur.execute('DELETE FROM muted_users WHERE room_id = %s AND user_id = %s', (body['roomId'], body['userId']))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'create_complaint':
                expires_days = 3 if body.get('status') == 'accepted' else 1
                expires_at = datetime.now() + timedelta(days=expires_days)
                cur.execute('''
                    INSERT INTO complaints (id, reporter_username, target_username, description, images, room_id, status, expires_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                ''', (body['id'], body['reporterUsername'], body['targetUsername'], body['description'],
                      body.get('images', []), body.get('roomId'), body.get('status', 'in_review'), expires_at))
                complaint = cur.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'complaint': dict(complaint)}, default=str)
                }
            
            elif action == 'update_complaint':
                expires_days = 3 if body.get('status') == 'accepted' else 1
                expires_at = datetime.now() + timedelta(days=expires_days)
                cur.execute('UPDATE complaints SET status = %s, expires_at = %s WHERE id = %s', 
                           (body['status'], expires_at, body['id']))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'update_room':
                cur.execute('''
                    UPDATE rooms 
                    SET name = %s, theme = %s, description = %s, max_participants = %s,
                        is_adult = %s, is_private = %s, is_locked = %s, password = %s
                    WHERE id = %s
                ''', (body['name'], body['theme'], body.get('description'), body['maxParticipants'],
                      body['isAdult'], body['isPrivate'], body['isLocked'], body.get('password'), body['id']))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            
            if params.get('type') == 'room':
                room_id = params.get('id')
                cur.execute('DELETE FROM room_participants WHERE room_id = %s', (room_id,))
                cur.execute('DELETE FROM messages WHERE room_id = %s', (room_id,))
                cur.execute('DELETE FROM banned_users WHERE room_id = %s', (room_id,))
                cur.execute('DELETE FROM muted_users WHERE room_id = %s', (room_id,))
                cur.execute('DELETE FROM rooms WHERE id = %s', (room_id,))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'})
        }
    
    finally:
        cur.close()
        conn.close()