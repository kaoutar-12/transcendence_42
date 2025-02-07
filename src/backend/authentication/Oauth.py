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
    
    print(code)
    return Response({'message': 'code recived successfully'})