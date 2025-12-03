import json
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, Any
import base64

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Send mortgage documents to broker email
    Args: event - dict with httpMethod, body (multipart/form-data), headers
          context - object with request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = event.get('body', '')
        is_base64 = event.get('isBase64Encoded', False)
        
        if is_base64:
            body = base64.b64decode(body).decode('utf-8')
        
        boundary = None
        content_type = event.get('headers', {}).get('content-type', '')
        if 'boundary=' in content_type:
            boundary = content_type.split('boundary=')[1].strip()
        
        if not boundary:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No boundary in content-type'}),
                'isBase64Encoded': False
            }
        
        parts = body.split(f'--{boundary}')
        form_data = {}
        files = []
        
        for part in parts:
            if 'Content-Disposition' in part:
                if 'filename=' in part:
                    name_start = part.find('name="') + 6
                    name_end = part.find('"', name_start)
                    field_name = part[name_start:name_end]
                    
                    filename_start = part.find('filename="') + 10
                    filename_end = part.find('"', filename_start)
                    filename = part[filename_start:filename_end]
                    
                    data_start = part.find('\r\n\r\n') + 4
                    data_end = part.rfind('\r\n')
                    file_data = part[data_start:data_end]
                    
                    files.append({
                        'field': field_name,
                        'filename': filename,
                        'data': file_data
                    })
                else:
                    name_start = part.find('name="') + 6
                    name_end = part.find('"', name_start)
                    field_name = part[name_start:name_end]
                    
                    value_start = part.find('\r\n\r\n') + 4
                    value_end = part.rfind('\r\n')
                    value = part[value_start:value_end]
                    
                    form_data[field_name] = value
        
        phone = form_data.get('phone', 'Не указан')
        inn = form_data.get('inn', 'Не указан')
        email_client = form_data.get('email', 'Не указан')
        children_option = form_data.get('childrenOption', 'none')
        
        children_text = {
            'one': 'Один ребенок до 7 лет',
            'two': 'Двое детей до 18 лет',
            'none': 'Нет детей / использована семейная ипотека'
        }.get(children_option, 'Не указано')
        
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.mail.ru')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        sender_email = os.environ.get('SENDER_EMAIL', '')
        sender_password = os.environ.get('SENDER_PASSWORD', '')
        recipient_email = 'sayfullin_polivanov_plus@mail.ru'
        
        if not sender_email or not sender_password:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Email credentials not configured'}),
                'isBase64Encoded': False
            }
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = f'Новая заявка на ипотеку от {phone}'
        
        body_text = f'''
Новая заявка на ипотеку

Контактные данные:
- Телефон: {phone}
- Email: {email_client}
- ИНН: {inn}
- Дети: {children_text}

Документы во вложении.

---
Заявка отправлена через систему Polivanov Plus
        '''
        
        msg.attach(MIMEText(body_text, 'plain', 'utf-8'))
        
        for file_info in files:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(file_info['data'].encode('latin-1'))
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {file_info["filename"]}'
            )
            msg.attach(part)
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'message': 'Documents sent successfully'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
