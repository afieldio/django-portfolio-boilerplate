from django import forms

class ContactForm(forms.Form):
	name = forms.CharField(label='Name')
	email = forms.EmailField(label='Email')
	phone = forms.IntegerField(label='Phone', required=False)
	description = forms.CharField(widget=forms.Textarea, label='Info')