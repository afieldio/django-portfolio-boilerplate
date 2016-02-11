from django.shortcuts import render, render_to_response, RequestContext

# Create your views here.


def home(request):
    context = RequestContext(request, {})
    return render_to_response('home.html', context_instance=context)

