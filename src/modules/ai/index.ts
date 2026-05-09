import { Module } from "@medusajs/framework/utils"
import AiModuleService from "./service.js"

export const AI_MODULE = "ai"

export default Module(AI_MODULE, {
  service: AiModuleService,
})
