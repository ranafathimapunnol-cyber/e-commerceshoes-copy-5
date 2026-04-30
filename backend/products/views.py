from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Product
from .serializers import ProductSerializer


@api_view(['GET'])
def getProducts(request):

    products = Product.objects.all()

    serializer = ProductSerializer(
        products,
        many=True
    )

    return Response(serializer.data)


@api_view(['GET'])
def getProduct(request, pk):

    product = Product.objects.get(id=pk)

    serializer = ProductSerializer(product)

    return Response(serializer.data)


@api_view(['POST'])
def createProduct(request):

    serializer = ProductSerializer(data=request.data)

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(['PUT'])
def updateProduct(request, pk):

    product = Product.objects.get(id=pk)

    serializer = ProductSerializer(
        product,
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(['DELETE'])
def deleteProduct(request, pk):

    try:
        product = Product.objects.get(id=pk)
        product.delete()

        return Response('Product deleted successfully')

    except:
        return Response('Product does not exist')
