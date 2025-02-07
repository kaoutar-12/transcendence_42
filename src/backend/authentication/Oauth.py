from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import requests


@api_view(['POST'])
@permission_classes([AllowAny])
def Oauth(request):
    
    code = request.data.get('code', None)
    # print(request.data)
    
    if not code:
        return Response({'message': 'Code is required'})
    url= "https://api.intra.42.fr/oauth/token/"
    url1 = "https://api.intra.42.fr/v2/me/"
    headers = {
        "Content-Type": "application/json",
    }
    body={
        'grant_type':'authorization_code',
        'client_id':'u-s4t2ud-4719e3779c459d1f6e4055ac6167c2cdc82154e41df26314bb0cdca56a1210e1',
        'client_secret':'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',
        'code': code,
        'redirect_uri': 'http://localhost:3000/call/',
    }
    try:
        response = requests.post(url, json=body, headers=headers)        
        if (response.ok):
            data = response.json()
            headers["Authorization"] = f"Bearer {data['access_token']}"
            response1 = requests.get(url1, headers=headers) 
            if (response1.ok):
                print(response1.json())
        
        return Response({'message': 'code recived successfully'})
    except requests.exceptions.RequestException as e:
        return Response({"error": str(e)})

    print(code)
    return Response({'message': 'code recived successfully'})