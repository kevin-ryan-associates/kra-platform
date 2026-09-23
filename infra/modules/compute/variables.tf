variable "vm_name" {
  description = "Name of the virtual machine (used for VM, NIC, and OS disk)"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet for the VM NIC"
  type        = string
}

variable "public_ip_id" {
  description = "ID of the public IP to attach to the NIC"
  type        = string
}

variable "nsg_id" {
  description = "ID of the network security group to associate with the NIC"
  type        = string
}

variable "vm_size" {
  description = "Azure VM size"
  type        = string
  default     = "Standard_B2ms"
}

variable "admin_username" {
  description = "SSH admin username"
  type        = string
  default     = "azureuser"
}

variable "admin_ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

variable "custom_data" {
  description = "Base64-encoded cloud-init configuration to run on first boot"
  type        = string
}
