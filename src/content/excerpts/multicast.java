// ACrispyCookie/ECE348-Distributed-Systems project2/simple-chat-app/src/main/java/dev/ioannikas/group/library/catoc/CatocManager.java@6caf1bf215a16ac048d3be27da8fc54b07b373c5 L434-L447
        private List<SerializableObject> checkBuffer() {
            List<SerializableObject> ready = new ArrayList<>();

            String id = deliveryOrder.get(delivered + 1);
            while (id != null && messages.get(id) != null) {
                ready.add(messages.remove(id));
                Printer.printDebug(api.getNetworkManager().getPort() + " [CatocManager] (Group " + groupId + ") TRM Request with ID " + id + " is being delivered");
                deliveryOrder.remove(delivered + 1);
                delivered++;
                id = deliveryOrder.get(delivered + 1);
            }

            return ready;
        }
